import { useLocation } from "react-router-dom";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { Fragment } from "react";

export function DynamicBreadcrumb() {
    const location = useLocation();
    const pathnames = location.pathname.split("/").filter((x) => x && x !== "dashboard");

    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink href="/dashboard">
                        Dashboard
                    </BreadcrumbLink>
                </BreadcrumbItem>
                {pathnames.map((name, index) => {
                    const routeTo = `/dashboard/${pathnames.slice(0, index + 1).join("/")}`;
                    const isLast = index === pathnames.length - 1;

                    return (
                        <Fragment key={routeTo}>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                {isLast ? (
                                    <BreadcrumbPage>{capitalize(name)}</BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink href={routeTo}>
                                        {capitalize(name)}
                                    </BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                        </Fragment>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
    );
}

