import {Component, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';

import {Breadcrumb} from "../core/breadcrumbs/breadcrumb";
import {BreadcrumbService} from "../core/breadcrumbs/breadcrumb.service";

import {Dashboard} from './dashboard';
import {DashboardService} from './dashboard.service';

import {FeedreaderService} from "../feedreader/feedreader.service";

import {Footer} from "../core/footer/footer";

import {PageService} from "../pages/page.service";

import {dashboardBreadcrumb, dashboardTitle} from "../app.settings";

@Component({
    selector: 'ad-dashboard',
    template: `
        <ad-header id="header" *ngIf="breadcrumbs" [breadcrumbs]="breadcrumbs"></ad-header>
        <div *ngIf="dashboard"id="content">
            <div style="width: 47%; float: left; padding-bottom: 1em; word-wrap: break-word;">
                <h1>Status <span style="font-size: small;">at {{dashboard.timeChecked}}</span></h1>
                <p *ngIf="dashboard.hostname"><strong>Hostname:</strong> {{dashboard.hostname}}</p>
                <h2>Caches</h2>
                <table>
                    <thead><tr><th>Type</th><th>Size</th></tr></thead>
                    <tbody>
                        <tr *ngIf="numberOfPages"><td>Database Pages</td><td>{{numberOfPages}}</td></tr>
                        <tr *ngIf="numberOfDynamicPages"><td>Generated Pages</td><td>{{numberOfDynamicPages}}</td></tr>
                        <tr *ngIf="numberOfEntries"><td>Feedreader Entries</td><td>{{numberOfEntries}}</td></tr>
                        <tr *ngIf="numberOfUnreadEntries"><td>Unread Entries</td><td>{{numberOfUnreadEntries}}</td></tr>
                    </tbody>
                </table>
                <h2>Version Information</h2>
                <p *ngIf="dashboard.gitVersion"><strong>Most Recent Commit:</strong> {{dashboard.gitVersion}}</p>
                <p *ngIf="dashboard.pythonPackages"><strong>Python Packages:</strong> {{dashboard.pythonPackages}}</p>
                <p *ngIf="dashboard.npmPackages"><strong>NPM Packages:</strong> {{dashboard.npmPackages}}</p>
            </div>
            <div style="width:47%; float:left; padding-left: 1em;">
                <h2>Settings Flags</h2>
                <span *ngFor="let flag of dashboard.settingsFlags"
                    [class.highlight]="flag.actual != flag.expected">
                        {{flag.name}}: {{flag.actual}}&ensp;
                </span>
                <h2>Recent Log Entries</h2>
                <p *ngFor="let entry of dashboard.logEntries">
                    <span [class.highlight]="entry.level == 'ERROR'">
                        {{entry.level}}: {{entry.msg}}<br>Logged {{entry.datetime}}
                    </span>
                </p>
            </div>
            <div style="clear:both"></div>
        </div>
        <ad-footer id="footer" *ngIf="footer" [footer]="footer" (onRefresh)="onRefresh()"></ad-footer>
        <ad-spinner *ngIf="showSpinner"></ad-spinner>
        `,
    providers: []
})
export class DashboardComponent implements OnInit {
    breadcrumbs: Breadcrumb[];
    dashboard: Dashboard;
    footer: Footer;
    numberOfDynamicPages: number;
    numberOfEntries: number;
    numberOfPages: number;
    numberOfUnreadEntries: number;
    showSpinner: Boolean = false;

    constructor(
        private breadcrumbService: BreadcrumbService,
        private dashboardService: DashboardService,
        private feedreaderService: FeedreaderService,
        private pageService: PageService,
        private titleService: Title) {
    }

    ngOnInit(): void {
        this.titleService.setTitle(dashboardTitle);
        this.populateHeader();
        this.populateFooter();
        this.getDashboard();
        this.getCaches();
    }

    populateHeader(): void  {
        this.breadcrumbs = this.breadcrumbService.addBreadcrumb(dashboardBreadcrumb);
    }

    populateFooter(): void  {
        this.footer = <Footer>{refreshFlag: true};
    }

    getDashboard(): void  {
        this.showSpinner = true;
        this.dashboardService
            .getDashboard()
            .subscribe(dashboard => {
                this.dashboard = dashboard;
                if (dashboard.settingsFlags != undefined)
                    this.showSpinner = false;
            });
    }

    getCaches(): void  {
        this.pageService.getPages()
            .subscribe(pages => this.numberOfPages = pages.length);
        this.numberOfDynamicPages = this.pageService.getDynamicPageBreadcrumbs().length;
        this.feedreaderService.getEntries()
            .subscribe(entries => {
                this.numberOfEntries = entries.length;
                this.numberOfUnreadEntries = entries.filter(entry => !entry.readFlag).length;
            })
    }

    onRefresh(): void  {
        this.showSpinner = true;
        this.dashboardService.initialPopulateDashboard();
    }
}
