import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { BlockchainService } from './services/blockchain.service';
import { BillingAmountComponent } from './components/billing-amount/billing-amount.component';
import { DataTrackerComponent } from './components/data-tracker/data-tracker.component';
import { FormatDatePipe } from './pipes/format-date.pipe';
import { FormatValuePipe } from './pipes/format-value.pipe';
import { ErrorComponent } from './components/error/error.component';

@NgModule({
  declarations: [
    AppComponent,
    BillingAmountComponent,
    DataTrackerComponent,
    ErrorComponent,
    FormatDatePipe,
    FormatValuePipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [
    BlockchainService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
