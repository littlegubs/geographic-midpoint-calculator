import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'

import { AppComponent } from './app.component'
import { GoogleMapsModule } from '@angular/google-maps'
import { RowComponent } from './components/row/row.component'
import {FormsModule, ReactiveFormsModule} from '@angular/forms'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatAutocompleteModule } from '@angular/material/autocomplete'
import { MatInputModule } from '@angular/material/input'
import { HttpClientModule } from '@angular/common/http'
import {MatButtonModule} from "@angular/material/button";
import {MatDividerModule} from "@angular/material/divider";
import {MatButtonToggleModule} from "@angular/material/button-toggle";
import {MatIconModule} from "@angular/material/icon";
import {NgbTypeahead} from "@ng-bootstrap/ng-bootstrap";

@NgModule({
    declarations: [AppComponent, RowComponent],
  imports: [
    BrowserModule,
    GoogleMapsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatInputModule,
    HttpClientModule,
    MatButtonModule,
    MatDividerModule,
    MatButtonToggleModule,
    MatIconModule,
    NgbTypeahead,
    FormsModule,
  ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
