import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router'

import * as showdown from 'showdown';

import {MarkdownPage} from './markdown-page';
import {MarkdownPageService} from './markdown-page.service';
import {Breadcrumb} from "../breadcrumbs/breadcrumb";
import {BreadcrumbService} from "../breadcrumbs/breadcrumb.service";
import {Footer} from "../footer/footer";
import {markdownBreadcrumb} from "../app.settings";

@Component({
    selector: 'ad-page',
    template: `
        <ad-header id="header" *ngIf="breadcrumbs" [breadcrumbs]="breadcrumbs"></ad-header>
        <div id="content">
            <div [innerHTML]="html_content"></div>
            <!--<page-source [page]="page"></page-source>-->
        </div>
        <ad-footer id="footer" *ngIf="footer" [footer]="footer"></ad-footer>
        `,
    providers: []
})


export class MarkdownPageDetailComponent implements OnInit {
    page: MarkdownPage;
    html_content: string;
    breadcrumbs: Breadcrumb[];
    footer: Footer;
    error: any;

    constructor(
        private markdownPageService:MarkdownPageService,
        private breadcrumbService:BreadcrumbService,
        private route: ActivatedRoute) {
    }

    ngOnInit(): void {
        this.getCurrentPage(this.route.snapshot.params['slug']);
    }

    getCurrentPage(slug:string) {
        this.markdownPageService
            .getPage(slug)
            .then(page => {
                this.page = page;

                var breadcrumb = new Breadcrumb({
                    title: this.page.title,
                    url: this.page.url,
                    updated: this.page.updated,
                    parentName: this.page.parentName});
                this.breadcrumbs = this.breadcrumbService.addBreadcrumb(breadcrumb);

                var converter = new showdown.Converter({'tables': true});
                this.html_content = converter.makeHtml(this.page.content);

                this.footer = new Footer({
                    updated: this.page.updated,
                    breadcrumbs: [
                        new Breadcrumb({title: 'Source', url: '#'}),
                        markdownBreadcrumb,
                    ],
                    adminUrl: `/admin/pages/page/${this.page.id}/change/`,
                });
            })
            .catch(error => this.error = error);
    }
}
