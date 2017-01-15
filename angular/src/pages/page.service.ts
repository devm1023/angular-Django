import {Injectable} from '@angular/core';
import {Http, Response} from '@angular/http';

import {Observable} from 'rxjs/Observable';
import {ReplaySubject} from "rxjs/ReplaySubject";

import {Breadcrumb} from "../core/breadcrumbs/breadcrumb";

import {Page} from './page';

import {SearchResult, SearchResults} from "../core/search/search-results";

import {MessageService} from "../core/message/message.service";

import {findStringContext} from "../utilities";

import {rootBreadcrumb} from '../app.settings';
import {toolsBreadcrumb, toolBreadcrumbs} from '../tools/tools.component'

import {apiEndpoint, dashboardBreadcrumb} from "../app.settings";

import {blogBreadcrumb, blogArchiveBreadcrumb} from "../blog/blog.component";
import {feedreaderBreadcrumb} from "../feedreader/feedreader.component";
import {timersBreadcrumb} from "../timers/timers.component";

const pageUrl: string = '/page';
export const messageSource: string = 'Page';

@Injectable()
export class PageService {

    currentPage$: ReplaySubject<any> = new ReplaySubject(1);

    pageCache: Page[] = [];
    pages$: ReplaySubject<any> = new ReplaySubject(1);

    breadcrumbCache: Breadcrumb[] = [];
    breadcrumbs$: ReplaySubject<any> = new ReplaySubject(1);

    constructor(
        private http: Http,
        private messageService: MessageService
    ) {
        this.pages$.next([]);
        this.breadcrumbs$.next([]);
        this.cacheAllPages();
    }

    getPage(slug:string): Observable<Page> {
        let url = `${apiEndpoint}/pages/read/${slug}`;
        let pages = this.pageCache.filter(page => page.url == `${pageUrl}/${slug}`);
        if (pages.length > 0)
            this.currentPage$.next(pages[0]);
        else
            this.http.get(url)
                .subscribe(
                    (response: Response) => {
                        let page: Page = <Page>response.json();
                        this.pageCache.push(page);
                        this.currentPage$.next(page);
                    },
                    error => {
                        this.messageService.addErrorMessage(
                            messageSource,
                            `${messageSource} error: From ${url}; Status Code ${error.status}; ${error.statusText}`);
                        console.log(error);
                    }
                );
        return this.currentPage$;
    }

    getPages(): ReplaySubject<any> {
        return this.pages$;
    }

    getBreadcrumbs(): ReplaySubject<any> {
        return this.breadcrumbs$;
    }

    getPageBreadcrumbs(slug: string): ReplaySubject<any> {
        let breadcrumbs = this.breadcrumbCache;
        if (slug != undefined) {
            var parent = this.pageCache.filter(page => page.url == `${pageUrl}/${slug}`)[0];
            breadcrumbs = this.breadcrumbCache.filter(breadcrumb => breadcrumb.parentName == parent.title);
        }
        this.breadcrumbs$.next(breadcrumbs);
        return this.breadcrumbs$;
    }

    refresh(url: string): Observable<Page> {
        this.pageCache = this.pageCache.filter(page => page.url != url);
        return this.getPage(url.replace(`${pageUrl}/`, ''));
    }

    cacheAllPages(): void {
        let url: string = `${apiEndpoint}/pages/all/`;
        this.http.get(url)
            .subscribe(
                (response: Response) => {
                    this.pageCache = <Page[]>response.json();
                    this.populatePageCache();
                    this.pages$.next(this.pageCache);
                    this.populateBreadcrumbCache();
                },
                error => {
                    this.messageService.addErrorMessage(
                        messageSource,
                        `${messageSource} error: From ${url}; Status Code ${error.status}; ${error.statusText}`);
                    console.log(error);
                }
            );
    }

    populatePageCache(): void {
        for (let page of this.pageCache) {
            if (page.parentId) {
                let parent = this.pageCache.filter(parent => parent.id == page.parentId)[0];
                page.parentName = parent.title;
            }
            let children = this.pageCache.filter(child => child.parentId == page.id);
            page.children = children.map(child => <Breadcrumb>{title: child.title,
                url: child.url, parentName: child.parentName, updated: child.updated});
        }
    }

    populateBreadcrumbCache(): void {
        let breadcrumbs: Breadcrumb[] = this.getDynamicPageBreadcrumbs();
        for (let page of this.pageCache)
            breadcrumbs.push(<Breadcrumb>{
                title: page.title,
                url: page.url,
                published: page.published,
                updated: page.updated,
                parentName: page.parentName,
                externalLinkFlag: false
            })
        this.breadcrumbCache = breadcrumbs;
        this.breadcrumbs$.next(breadcrumbs);
    }

    getDynamicPageBreadcrumbs(): Breadcrumb[] {
        let breadcrumbs = [];
        breadcrumbs.push(blogBreadcrumb);
        breadcrumbs.push(blogArchiveBreadcrumb);
        breadcrumbs.push(dashboardBreadcrumb);
        breadcrumbs.push(feedreaderBreadcrumb);
        breadcrumbs.push(rootBreadcrumb);
        breadcrumbs.push(timersBreadcrumb);
        breadcrumbs.push(toolsBreadcrumb);

        for (let toolBreadcrumb of toolBreadcrumbs) {
            toolBreadcrumb.parentName = 'Tools';
            breadcrumbs.push(toolBreadcrumb);
        }

        return breadcrumbs;
    }

    search(searchString: string): SearchResults {
        let searchResults: SearchResults = new SearchResults();
        let searchStringLower = searchString.toLocaleLowerCase();

        for (let breadcrumb of this.breadcrumbCache) {
            let matchPosition = breadcrumb.title.toLocaleLowerCase().indexOf(searchStringLower);
            if (matchPosition == -1)
                continue;
            let searchResult: SearchResult = new SearchResult();
            searchResult.breadcrumb = breadcrumb;
            searchResults.titleMatches.push(searchResult);
        }

        for (let i = 0; i < this.pageCache.length; i++) {
            let page = this.pageCache[i];
            let content = page.content;
            let matchContext: string = findStringContext(searchStringLower, content);

            if (matchContext) {
                let searchResult: SearchResult = new SearchResult();
                searchResult.match = matchContext;
                searchResult.breadcrumb = <Breadcrumb>{title: page.title, url: page.url};

                searchResults.contentMatches.push(searchResult);
            }
        }

        return searchResults;
    }
}
