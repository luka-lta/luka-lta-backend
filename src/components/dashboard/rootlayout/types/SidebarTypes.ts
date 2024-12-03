import {LucideIcon} from "lucide-react";

interface User {
    name: string;
    email: string;
    avatar: string;
}

interface NavItem {
    title: string;
    url: string;
    icon: LucideIcon;
    tooltip?: string;
    dropdown: DropdownItem[];
}

interface DropdownItem {
    title: string;
    url: string;
    icon: LucideIcon;
}

interface Navigation {
    user: User;
    navMain: NavItem[];
}

export type {Navigation, NavItem, DropdownItem, User};