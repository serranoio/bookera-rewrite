package main

import (
	"net/http"
	"path"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

const V1 = "v1"
const BOOK = "book"

type Body struct {
	Content string `json:"content"`
}

type MarginConfig struct {
	Left   int `json:"left"`
	Right  int `json:"right"`
	Top    int `json:"top"`
	Bottom int `json:"bottom"`
}

type ParagraphConfig struct {
	Left   int `json:"left"`
	Right  int `json:"right"`
	Top    int `json:"top"`
	Bottom int `json:"bottom"`
}

type ImageConfig struct {
	Alignment string `json:"alignment"` // "left", "center", or "right"
}

type TypeSetting struct {
	Margin    MarginConfig    `json:"margin"`
	Paragraph ParagraphConfig `json:"paragraph"`
	Image     ImageConfig     `json:"image"`
}

type CoverConfig struct {
	// Define fields as necessary
}

type TableOfContentsConfig struct {
	// Define fields as necessary
}

type CopyrightConfig struct {
	// Define fields as necessary
	Authors     []string `json:"authors"`
	Tags        []string `json:"tags"`
	Description string   `json:"description"`
	Title       string   `json:"title"`
	Subtitle    string   `json:"subtitle"`
	Date        string   `json:"date"`
	Rights      string   `json:"rights"`
	Language    string   `json:"language"`
	Identifiers []string `json:"identifiers"`
	Publishers  []string `json:"publishers"`
}

type DedicationConfig struct {
	// Define fields as necessary
}

type EpigraphConfig struct {
	// Define fields as necessary
}

type GlossaryConfig struct {
	// Define fields as necessary
}

type CitationConfig struct {
	// Define fields as necessary
}

type FrontMatter struct {
	Cover           CoverConfig           `json:"cover"`
	TableOfContents TableOfContentsConfig `json:"tableOfContents"`
	Copyright       CopyrightConfig       `json:"copyright"`
	Dedication      DedicationConfig      `json:"dedication"`
	Epigraph        EpigraphConfig        `json:"epigraph"`
	Glossary        GlossaryConfig        `json:"glossary"`
	Citations       CitationConfig        `json:"citations"`
}

type ChooseYourOwnAdventureConfig struct {
	// Define fields as necessary
}

type DiagramsConfig struct {
	// Define fields as necessary
}

type WebFeaturesConfig struct {
	// Define fields as necessary
}

type BookeraPlus struct {
	ChooseYourOwnAdventure ChooseYourOwnAdventureConfig `json:"ChooseYourOwnAdventure"`
	Diagrams               DiagramsConfig               `json:"Diagrams"`
	WebFeatures            WebFeaturesConfig            `json:"WebFeatures"`
}

type EBook struct {
	Body        Body        `json:"body"`
	TypeSetting TypeSetting `json:"typesetting"`
	Frontmatter FrontMatter `json:"frontmatter"`
	BookeraPlus BookeraPlus `json:"bokkeraPlus"`
}

type Meta struct {
	Authors []struct {
		Name string `json:"name"`
	} `json:"authors"`
	Tags []struct {
		Name string `json:"name"`
	} `json:"tags"`
	Title    string `json:"title"`
	Subtitle string `json:"subtitle"`
	Date     string `json:"date"`
	Language string `json:"language"`
	Rights   string `json:"rights"`
}

type Interior struct {
	Payload       string   `json:"payload"`
	SectionTitles []string `json:"sectionTitles"`
}

type EBookMiddle struct {
	Meta     `json:"meta"`
	Interior `json:"interior"`
}

var lastProducedBook string

func initAPI() {
	r := gin.Default()

	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	config.AllowMethods = []string{"GET", "POST", "PUT", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Authorization", "Accept"}

	r.Use(cors.New(config))

	r.POST(path.Join(V1, BOOK), func(c *gin.Context) {
		var ebook EBook

		if err := c.BindJSON(&ebook); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{})
			return
		}

		bookID, err := createHTMLBook(ebook)

		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "failed to create book",
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"id": bookID,
		})
	})

	// zip -r ../output.epub *
	r.GET(path.Join(V1, "serve", ":id"), func(c *gin.Context) {
		id := c.Param("id")

		c.Header("Content-Type", "application/epub+zip")
		c.File(path.Join("output", id))
	})
	r.Run()

}
