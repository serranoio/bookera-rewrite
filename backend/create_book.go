package main

import (
	"archive/zip"
	"context"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path"
	"path/filepath"
	"strings"

	"github.com/a-h/templ"
	"github.com/google/uuid"
)

func toUpperCase(s string) string {
	allWords := ""
	for _, word := range strings.Split(s, "-") {

		allWords += strings.ToUpper(word[0:1]) + strings.ToLower(word[1:]) + " "

	}
	return strings.TrimSpace(allWords)
}

func createFile(ebook EBook, dirName string, fileName string) error {
	file, _ := os.Create(path.Join(dirName, fileName))

	var component templ.Component

	if strings.Contains(fileName, "nav") {
		component = Nav(ebook)
	} else if strings.Contains(fileName, "content") {
		component = Content(ebook)
	}

	component.Render(context.Background(), file)

	return nil
}

func (e *EBook) fixPayload() {
	e.Body.Content = strings.ReplaceAll(e.Body.Content, "<br>", "")
	e.Body.Content = strings.ReplaceAll(e.Body.Content, "&nbsp;", "")
	e.Body.Content = strings.ReplaceAll(e.Body.Content, "<hr>", "<p class=\"pagebreak\">* * *</p>")
	// e.Body.Content = strings.ReplaceAll(e.Body.Content, "<", "&lt;")
	// e.Body.Content = strings.ReplaceAll(e.Body.Content, ">", "&gt;")
}

func sectionTitleName(sectionTitle string) string {
	return toUpperCase(sectionTitle[strings.Index(sectionTitle, "_")+1:])
}

func createEPUBFolder(ebook EBook, bookName string) error {
	epubPath := path.Join(bookName, "EPUB")
	os.Mkdir(epubPath, 0755)

	ebook.fixPayload()

	createFile(ebook, epubPath, "content_001.xhtml")
	createFile(ebook, epubPath, "nav.xhtml")

	file, _ := os.Create(path.Join(epubPath, "package.opf"))
	file.WriteString(PackageOPF(ebook))

	styles, _ := os.Create(path.Join(epubPath, "styles.css"))
	styles.WriteString(Styles(ebook))

	return nil
}

func createMETA_INFFolder(ebook EBook, bookName string) error {
	folderPath := path.Join(bookName, "META-INF")
	os.Mkdir(folderPath, 0755)

	file, _ := os.Create(path.Join(folderPath, "container.xml"))
	file.WriteString(ContainerXML(ebook))

	return nil
}

func createMIMETYPEFile(writer *zip.Writer, bookPath string) error {
	file, _ := os.Create(path.Join(bookPath, "mimetype"))
	file.WriteString("application/epub+zip")

	fi, err := file.Stat()
	if err != nil {
		return err
	}

	header := &zip.FileHeader{
		Name:   fi.Name(),
		Method: zip.Store,
	}

	w, err := writer.CreateHeader(header)
	if err != nil {
		return err
	}

	file.Seek(0, 0)

	_, err = io.Copy(w, file)
	if err != nil {
		return err
	}

	return nil
}

func createHTMLBook(ebook EBook) (string, error) {
	bookName := uuid.New().String() + ".epub"

	if len(ebook.Frontmatter.Copyright.Identifiers) == 0 {
		ebook.Frontmatter.Copyright.Identifiers = append(ebook.Frontmatter.Copyright.Identifiers, bookName)
	} else {
		ebook.Frontmatter.Copyright.Identifiers[0] = bookName
	}

	dir := "books"

	os.Mkdir(dir, 0755)

	bookPath := path.Join(dir, bookName)
	os.Mkdir(bookPath, 0755)

	createEPUBFolder(ebook, bookPath)
	createMETA_INFFolder(ebook, bookPath)

	sourceDir := bookPath
	outputFile := "output/" + bookName

	// Create the zip file
	zipFile, err := os.Create(outputFile)
	if err != nil {
		fmt.Println("Error creating zip file:", err)
		return bookName, err
	}
	defer zipFile.Close()

	// Create a new zip writer
	writer := zip.NewWriter(zipFile)
	defer writer.Close()

	err = createMIMETYPEFile(writer, bookPath)
	if err != nil {
		return bookName, err
	}

	// zip files
	err = filepath.Walk(sourceDir, func(file string, fi os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		if file == sourceDir || strings.Contains(file, "mimetype") {
			return nil
		}

		// Create a zip header based on file info
		header, err := zip.FileInfoHeader(fi)
		if err != nil {
			return err
		}

		// // Adjust the header name to be relative to the source directory
		header.Name, err = filepath.Rel(filepath.Dir(sourceDir), file)
		if err != nil {
			return err
		}

		header.Name = strings.Join(strings.Split(header.Name, "/")[1:], "/")

		// If the file is a directory, set the method to store
		if fi.IsDir() {
			header.Method = zip.Store
		} else {
			header.Method = zip.Deflate
		}

		// Create a writer for the header
		zipWriter, err := writer.CreateHeader(header)
		if err != nil {
			return err
		}

		// Open the source file for reading
		if !fi.IsDir() {
			srcFile, err := os.Open(file)
			if err != nil {
				return err
			}
			defer srcFile.Close()

			// Copy the file data to the zip writer
			_, err = io.Copy(zipWriter, srcFile)
			return err
		}
		return nil
	})

	if err != nil {
		fmt.Println("Error walking through source directory:", err)
	} else {
		fmt.Println("Zipped successfully to", outputFile)
		if programArgs.Test {
			os.Rename(outputFile, "test.epub")
		}
	}

	cmd := exec.Command("epubcheck", outputFile)

	_, err = cmd.Output()

	var errString string
	if exiterr, ok := err.(*exec.ExitError); ok {
		errString = string(exiterr.Stderr)
		os.WriteFile("debug.txt", []byte(errString), 0755)
	}

	return bookName, nil
}
