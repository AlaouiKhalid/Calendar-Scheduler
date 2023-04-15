import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  NgbNavModule,
  NgbCollapseModule,
  NgbTooltipModule,
} from '@ng-bootstrap/ng-bootstrap';
import { Angulartics2Module } from 'angulartics2';
import { DragAndDropModule } from 'angular-draggable-droppable';
import { DemoAppComponent } from './demo-app.component';
import { DemoComponent as DefaultDemoComponent } from './demo-modules/kitchen-sink/component';
import { DemoModule as DefaultDemoModule } from './demo-modules/kitchen-sink/module';
import { environment } from '../environments/environment';
import { FormsModule } from '@angular/forms';
import { ClipboardModule } from 'ngx-clipboard';

@NgModule({
  declarations: [DemoAppComponent],
  bootstrap: [DemoAppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    NgbNavModule,
    NgbCollapseModule,
    NgbTooltipModule,
    DragAndDropModule,
    Angulartics2Module.forRoot({
      developerMode: !environment.production,
    }),
    ClipboardModule,
    DefaultDemoModule,
    RouterModule.forRoot(
      [
        {
          path: 'kitchen-sink',
          component: DefaultDemoComponent,
          data: {
            label: 'Calendrier Absence',
          },
        },
        {
          path: '**',
          redirectTo: 'kitchen-sink',
        }
      ],
      {
        useHash: true,
      }
    )
  ]
})
export class DemoAppModule {}
