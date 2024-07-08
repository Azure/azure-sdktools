import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavBarComponent } from 'src/app/_components/shared/nav-bar/nav-bar.component';
import { FooterComponent } from 'src/app/_components/shared/footer/footer.component';
import { LanguageNamesPipe } from 'src/app/_pipes/language-names.pipe';
import { LastUpdatedOnPipe } from 'src/app/_pipes/last-updated-on.pipe';
import { ApprovalPipe } from 'src/app/_pipes/approval.pipe';

@NgModule({
  declarations: [
    NavBarComponent,
    FooterComponent,
    LanguageNamesPipe,
    LastUpdatedOnPipe,
    ApprovalPipe
  ],
  exports: [
    NavBarComponent,
    FooterComponent,
    LanguageNamesPipe,
    LastUpdatedOnPipe,
    ApprovalPipe
  ],
  imports: [
    CommonModule
  ]
})
export class SharedAppModule { }
