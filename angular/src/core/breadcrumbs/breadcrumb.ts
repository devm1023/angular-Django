interface BreadcrumbOptions {
    title: string;
    url: string;
    published?: string;
    updated?: string;
    parentName?: string;
    linkFlag?: boolean;
}

export class Breadcrumb {
    title: string;
    url: string;
    published: string;
    updated: string;
    parentName: string;
    linkFlag: boolean;

    constructor(args: BreadcrumbOptions) {
        this.title = args.title;
        this.url = args.url;
        this.published = args.published;
        this.updated = args.updated;
        this.parentName = args.parentName;
        this.linkFlag = args.linkFlag;
    }
}
