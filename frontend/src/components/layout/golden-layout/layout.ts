import { ItemType, LayoutConfig } from "../../libs/golden-layout/src";
import { BooleanComponent } from "./boolean";


// * What I use
export interface Layout {
	name: string;
	config: LayoutConfig;
}

export const miniRowConfig: LayoutConfig = {
	root: {
			type: ItemType.row,
			content: [
			],
	},
};

export const secondConfig: LayoutConfig = {
	root: {
			type: ItemType.row,
			content: [
					{
							type: "component",
							header: {
									show: "top",
							},
							isClosable: false,
							componentType: BooleanComponent.typeName,
							size: '40%',
					},
			],
	},
};