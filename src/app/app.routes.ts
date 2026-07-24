import { Routes } from '@angular/router';
import { System7DesktopComponent } from './components/system7-desktop/system7-desktop.component';
import { SadMacComponent } from './components/sad-mac/sad-mac.component';

export const routes: Routes = [
  { path: '', component: System7DesktopComponent },
  { path: 'sad-mac', component: SadMacComponent },
  { path: '**', redirectTo: '' }
];
