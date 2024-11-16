import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { SolarSystemModelComponent } from './solar-system-model/solar-system-model.component';
import { DetailedInfoComponent } from './detailed-info/detailed-info.component';
import { FunFactsComponent } from './fun-facts/fun-facts.component';
import { AboutMeComponent } from './about-me/about-me.component';
import { routes } from './app.routes';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
    SolarSystemModelComponent,
    DetailedInfoComponent,
    FunFactsComponent,
    AboutMeComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
