import { createContext } from "@lit/context";
import { Label } from "./context";

export const studioSettingsContextKey = "settings-context"


export const studioSettingsContext = createContext<StudioSettings>(Symbol(studioSettingsContextKey));

export enum ExtractContentsMode {
	PART = "Part",
	CHAPTER = "Chapter",
	HEADING = "Heading",
	SUB_HEADING = "Subheading",
}

export interface ExtractContentsConfig {
	mode: ExtractContentsMode;
}

export interface StudioSettings {
	labels: Label[];
	extractContentsConfig: ExtractContentsConfig;
}

export const defaultSettings: StudioSettings = {
	labels: [],
	extractContentsConfig: {
		mode: ExtractContentsMode.SUB_HEADING
	}
}

export const SettingsChanges = "settings-changes"
