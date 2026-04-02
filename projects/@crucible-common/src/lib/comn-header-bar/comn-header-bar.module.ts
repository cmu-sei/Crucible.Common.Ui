// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ComnHeaderBarComponent } from './components/comn-header-bar/comn-header-bar.component';

@NgModule({
  declarations: [
    ComnHeaderBarComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ComnHeaderBarComponent
  ]
})
export class ComnHeaderBarModule { }
