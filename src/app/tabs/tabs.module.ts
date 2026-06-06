import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { TabsPage } from './tabs.page';
import { TabsRoutingModule } from './tabs-routing.module';
import { Tab1Page } from '../tab1/tab1.page';
import { Tab2Page } from '../tab2/tab2.page';
import { Tab3Page } from '../tab3/tab3.page';

@NgModule({
  declarations: [TabsPage, Tab1Page, Tab2Page, Tab3Page],
  imports: [CommonModule, IonicModule, TabsRoutingModule],
})
export class TabsModule {}
