import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';

import {AppComponent} from './app.component';
import {DashboardComponent} from "./dashboard/dashboard.component";
import {HomepageComponent} from "./homepage/homepage.component";
import {PageDetailComponent} from "./pages/page-detail.component";
import {PageService} from "./pages/page.service";
import {routing} from "./app.routes";
import {FooterComponent} from "./footer.component";
import {HeaderComponent} from "./header.component";
import {ContentComponent} from "./content.component";
import {PageSourceComponent} from "./pages/page-source.component";

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        routing,
    ],
    declarations: [
        AppComponent,
        ContentComponent,
        DashboardComponent,
        FooterComponent,
        HeaderComponent,
        HomepageComponent,
        PageDetailComponent,
        PageSourceComponent,
    ],
    providers: [
        PageService,
    ],
    bootstrap: [AppComponent]
})

export class AppModule { }
