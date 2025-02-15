export interface Body {
	content: string;
}

export interface MarginConfig {
	left: number;
	right: number;
	top: number;
	bottom: number;
}

export interface ParagraphConfig {
	left: number;
	right: number;
	top: number;
	bottom: number;
}

export interface ImageConfig {
	alignment: "left" | "center" | "right";
}

export interface TypeSetting {
	margin: MarginConfig;
	paragraph: ParagraphConfig;
	image: ImageConfig;
}

export interface CoverConfig {
	
}
	
export interface TableOfContentsConfig {

}

export interface CopyrightConfig {
	authors: string[];
	tags: string[];
	title: string;
	subtitle: string;
	date: string;
	language: string;
	rights: string;
	description: string;
	identifiers: string[];
	publishers: string[];
}

export interface DedicationConfig {

}

export interface EpigraphConfig {	}

export interface GlossaryConfig {}

export interface CitationConfig {}

export interface FrontMatter {
	cover: CoverConfig;
	tableOfContents: TableOfContentsConfig;
	copyright: CopyrightConfig;
	dedication: DedicationConfig;
	epigraph: EpigraphConfig;
	glossary: GlossaryConfig;
	citations: CitationConfig;
}

export interface ChooseYourOwnAdventureConfig {}

export interface DiagramsConfig {}	

export interface WebFeaturesConfig {}

export interface BookeraPlus {
	ChooseYourOwnAdventure: ChooseYourOwnAdventureConfig;
	Diagrams: DiagramsConfig;
	WebFeatures: WebFeaturesConfig
}

export interface EBook {
	body: Body;
	typesetting: TypeSetting;
	frontmatter: FrontMatter;
	bokkeraPlus: BookeraPlus;
}

export const ebook: EBook = {
	body: {
			content: "This is the main content of the eBook."
	},
	typesetting: {
			margin: {
					left: 10,
					right: 10,
					top: 15,
					bottom: 15
			},
			paragraph: {
					left: 20,
					right: 20,
					top: 10,
					bottom: 10
			},
			image: {
					alignment: "center"
			}
	},
	frontmatter: {
			cover: {},
			tableOfContents: {},
			copyright: {
					identifiers: [""],
					authors: ["David-Serrano"],
					description: "description for a book!",
					tags: [],
					title: "New title",
					subtitle: "",
					date: new Date().getUTCDate().toString(),
					language: "es",
					rights: "",
					publishers: ["Bookera"],
			},
			dedication: {},
			epigraph: {},
			glossary: {},
			citations: {}
	},
	bokkeraPlus: {
			ChooseYourOwnAdventure: {},
			Diagrams: {},
			WebFeatures: {}
	}
};
