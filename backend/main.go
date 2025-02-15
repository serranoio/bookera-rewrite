package main

import (
	"os"
	"strings"
)

type ProgramArgs struct {
	Test bool
}

var programArgs ProgramArgs

func captureArguments() {
	if len(os.Args) > 0 {
		for _, arg := range os.Args {
			if strings.Contains(arg, "generateFile") {
				programArgs.Test = true
			}
		}
	}
}

func setup() {
	captureArguments()
}

func main() {
	setup()

	if !programArgs.Test {
		initAPI()
	}

}
