import * as Misskey from "calckey-js";
import { ComputedRef, Ref } from "vue";

export type MenuClasses =
	| Array<string>
	| Ref<Array<string>>
	| ComputedRef<Array<string>>;
export type MenuBase = {
	classes?: MenuClasses;
	hidden?: boolean | Ref<boolean>;
	visible?: boolean | Ref<boolean>;
};

export type MenuAction = (ev: MouseEvent) => void;

export type MenuDivider = null;
export type MenuNull = undefined;
export type MenuLabel = MenuBase & {
	type: "label";
	text: string;
	textStyle?: string;
};
export type MenuLink = MenuBase & {
	type: "link";
	to: string;
	text: string;
	textStyle?: string;
	icon?: string;
	indicate?: boolean;
	avatar?: Misskey.entities.User;
};
export type MenuA = MenuBase & {
	type: "a";
	href: string;
	target?: string;
	download?: string;
	text: string;
	textStyle?: string;
	icon?: string;
	indicate?: boolean;
};
export type MenuUser = MenuBase & {
	type: "user";
	user: Misskey.entities.User;
	active?: boolean;
	indicate?: boolean;
	action: MenuAction;
};
export type MenuSwitch = MenuBase & {
	type: "switch";
	ref: Ref<boolean>;
	text: string;
	textStyle?: string;
	disabled?: boolean;
};
export type MenuButton = MenuBase & {
	type?: "button";
	text: string;
	textStyle?: string;
	icon?: string;
	indicate?: boolean;
	danger?: boolean;
	active?: boolean;
	avatar?: Misskey.entities.User;
	action: MenuAction;
};
export type MenuButtonMultipleIcons = MenuBase & {
	type?: "button";
	text: string;
	textStyle?: string;
	icons: string[];
	indicate?: boolean;
	danger?: boolean;
	active?: boolean;
	avatar?: Misskey.entities.User;
	action: MenuAction;
};
export type MenuInput = MenuBase & {
	type: "input";
	ref: Ref<string>;
	placeholder: string;
	disabled?: boolean;
	required?: boolean | Ref<boolean>;
};
export type MenuParent = MenuBase & {
	type: "parent";
	text: string;
	textStyle?: string;
	icon?: string;
	children: OuterMenuItem[];
};

export type MenuPending = MenuBase & {
	type: "pending";
};

type OuterMenuItem =
	| MenuDivider
	| MenuNull
	| MenuLabel
	| MenuLink
	| MenuA
	| MenuUser
	| MenuSwitch
	| MenuButton
	| MenuButtonMultipleIcons
	| MenuInput
	| MenuParent;
type OuterPromiseMenuItem = Promise<
	| MenuLabel
	| MenuLink
	| MenuA
	| MenuUser
	| MenuSwitch
	| MenuButton
	| MenuButtonMultipleIcons
	| MenuInput
	| MenuParent
>;
export type MenuItem = OuterMenuItem | OuterPromiseMenuItem;
export type InnerMenuItem =
	| MenuDivider
	| MenuPending
	| MenuLabel
	| MenuLink
	| MenuA
	| MenuUser
	| MenuSwitch
	| MenuButton
	| MenuButtonMultipleIcons
	| MenuInput
	| MenuParent;
