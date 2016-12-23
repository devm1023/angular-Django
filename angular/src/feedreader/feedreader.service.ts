import {Injectable} from '@angular/core';
import {Http} from '@angular/http';

import {Observable} from 'rxjs';
import {ReplaySubject} from "rxjs/ReplaySubject";

import {Entry, Feed} from './feedreader';

import {feedreaderUrl} from "./feedreader.component";
import {apiEndpoint} from "../app.settings";

const feedreaderPollMinute: number = 18;

@Injectable()
export class FeedreaderService {

    feedCache: Feed[] = [];
    feeds$: ReplaySubject<any> = new ReplaySubject(1);

    entryCache: Entry[] = [];
    entries$: ReplaySubject<any> = new ReplaySubject(1);

    constructor(private http:Http) {
        this.feeds$.next([]);
        this.entries$.next([]);
        this.checkForUpdates();
    }

    getFeeds(): ReplaySubject<any> {
        return this.feeds$;
    }

    getEntries(): ReplaySubject<any> {
        return this.entries$;
    }

    refreshCaches(): void {
        Observable.forkJoin([
            this.http.get(`${apiEndpoint}${feedreaderUrl}/feeds`)
                .map(res => {
                    this.feedCache = res.json() as Feed[];
                    this.feeds$.next(this.feedCache);
                }),
            this.http.get(`${apiEndpoint}${feedreaderUrl}/entries`)
                .map(res => {
                    this.entryCache = res.json() as Entry[];
                    this.entries$.next(this.entryCache);
                })
        ]).subscribe()
    }

    checkForUpdates(): void {
        this.refreshCaches();

        let now: Date = new Date();
        let currentMinute: number = now.getUTCMinutes();
        let interval = (currentMinute > feedreaderPollMinute) ?
            ((currentMinute - feedreaderPollMinute + 60) * 1000 * 60 * 60) :
            ((feedreaderPollMinute - currentMinute) * 1000 * 60 * 60)

        setInterval(() => this.checkForUpdates(), interval);
    }
}
