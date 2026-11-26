import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PdfUploadFormComponent } from '../../components/pdf-upload-form/pdf-upload-form.component';
import { XmlExchangeComponent } from '../../components/xml-exchange/xml-exchange.component';

/** Administration page: composition of the two admin tools. */
@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [PdfUploadFormComponent, XmlExchangeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1>Administration</h1>
    <app-pdf-upload-form />
    <app-xml-exchange />
  `,
})
export class AdminPageComponent {}
