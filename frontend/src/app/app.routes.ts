import { Routes } from '@angular/router';
import { PromptListComponent } from './components/prompt-list/prompt-list.component';
import { PromptDetailComponent } from './components/prompt-detail/prompt-detail.component';
import { AddPromptComponent } from './components/add-prompt/add-prompt.component';
import { AboutComponent } from './components/about/about.component';
import { EditPromptComponent } from './components/edit-prompt/edit-prompt.component';
import { LoginComponent } from './components/login/login.component';
import { authGuard } from './services/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'about', component: AboutComponent },
  { path: 'login', component: LoginComponent },
  { path: 'prompts', component: PromptListComponent, canActivate: [authGuard] },
  { path: 'prompts/:id', component: PromptDetailComponent, canActivate: [authGuard] },
  { path: 'edit-prompt/:id', component: EditPromptComponent, canActivate: [authGuard] },
  { path: 'add-prompt', component: AddPromptComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'login' },
];
