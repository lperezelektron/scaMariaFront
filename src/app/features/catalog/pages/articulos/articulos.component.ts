import { Component } from '@angular/core';
import { SHARED_IMPORTS } from '../../../../shared/imports/shared-imports';

@Component({
  selector: 'app-articulos',
  standalone: true,
  imports: [...SHARED_IMPORTS],
  templateUrl: './articulos.component.html',
  styleUrl: './articulos.component.scss'
})
export class ArticulosComponent {

}
