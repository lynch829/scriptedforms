// scriptedforms
// Copyright (C) 2017 Simon Biggs

// Licensed under both the Apache License, Version 2.0 (the "Apache-2.0") and 
// GNU Affrero General Public License as published by the Free Software 
// Foundation, either version 3 of the License, or (at your option) any later 
// version (the "AGPL-3.0+").

// You may not use this file except in compliance with both the Apache-2.0 AND 
// the AGPL-3.0+ in combination (the "Combined Licenses").

// You may obtain a copy of the AGPL-3.0+ at

//     https://www.gnu.org/licenses/agpl-3.0.txt

// You may obtain a copy of the Apache-2.0 at 

//     https://www.apache.org/licenses/LICENSE-2.0.html

// Unless required by applicable law or agreed to in writing, software
// distributed under the Combined Licenses is distributed on an "AS IS" BASIS, 
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See 
// the Combined Licenses for the specific language governing permissions and 
// limitations under the Combined Licenses.



/**
 * Since the template for the form changes within the user interface
 * the form component needs to be re-compiled each time the template changes.
 * 
 * This file exports a the `createFormComponentFactory` function which
 * creates a new form component factory based on the provided template.
 * 
 * Within that function is the `FormComponent`. This component takes in the
 * provided template and then initialises the form.
 * 
 * Form initialisation logic and ordering is all defined within the `initialiseForm`
 * function within the `FormComponent`.
 */


import {
  Component, ViewChildren, QueryList,
  Compiler, ComponentFactory, NgModule,
  ModuleWithComponentFactories, ElementRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule }   from '@angular/forms';

import {
  PromiseDelegate
} from '@phosphor/coreutils';

import {
  MaterialModule
} from '../material.module';

import { KernelService } from '../services/kernel.service';
import { VariableService } from '../services/variable.service';
import { FileService } from '../services/file.service';

import { SectionsModule } from '../sections-module/sections.module';
import { StartComponent } from '../sections-module/start.component';
import { LiveComponent } from '../sections-module/live.component';
import { ButtonComponent } from '../sections-module/button.component';
import { OutputComponent } from '../sections-module/output.component';

import { VariablesModule } from '../variables-module/variables.module';
import { ToggleComponent } from '../variables-module/toggle.component';
import { TickComponent } from '../variables-module/tick.component';
// import { ConditionalComponent } from '../variables-module/conditional.component';

import { NumberComponent } from '../variables-module/number.component';
import { SliderComponent } from '../variables-module/slider.component';
import { TableComponent } from '../variables-module/table.component';

import { StringComponent } from '../variables-module/string.component';
import { DropdownComponent } from '../variables-module/dropdown.component';
import { PasswordComponent } from '../variables-module/password.component';

import { CodeModule } from '../code-module/code.module';
import { CodeComponent } from '../code-module/code.component';

import { VariableComponent } from '../types/variable-component';
import { SectionComponent } from '../types/section-component';

export
interface IFormComponent {
  formViewInitialised: PromiseDelegate<void>,
  formReady: PromiseDelegate<void>
}


/**
 * Create a form component factory given an Angular template in the form of metadata.
 * 
 * @param compiler the Angular compiler
 * @param metadata the template containing metadata
 * 
 * @returns a factory which creates form components
 */
export
function createFormComponentFactory(sessionId: string, compiler: Compiler, metadata: Component): ComponentFactory<IFormComponent> {

//   const templateAppendTop = `

// <form (ngSubmit)="onSubmit()" #scriptedForm="ngForm">

// `
//   const templateAppendBottom = `
  
// <button class="floating-submit" type="submit" mat-fab [disabled]="!scriptedForm.form.valid"><mat-icon>save</mat-icon></button> 
// </form>

//   `

//   metadata.template = templateAppendTop + metadata.template + templateAppendBottom

  /**
   * The form component that is built each time the template changes
   */
  @Component(metadata)
  class FormComponent {
    formViewInitialised = new PromiseDelegate<void>()
    formReady = new PromiseDelegate<void>()

    variableComponents: VariableComponent[] = []
    sectionComponents: SectionComponent[] = []

    // Sections
    @ViewChildren(StartComponent) startComponents: QueryList<StartComponent>;
    @ViewChildren(LiveComponent) liveComponents: QueryList<LiveComponent>;
    @ViewChildren(ButtonComponent) buttonComponents: QueryList<ButtonComponent>;
    @ViewChildren(OutputComponent) outputComponents: QueryList<OutputComponent>;

    // Variables
    @ViewChildren(ToggleComponent) toggleComponents: QueryList<ToggleComponent>;
    @ViewChildren(TickComponent) tickComponents: QueryList<TickComponent>;
    // @ViewChildren(ConditionalComponent) conditionalComponents: QueryList<ConditionalComponent>;

    @ViewChildren(NumberComponent) numberComponents: QueryList<NumberComponent>;
    @ViewChildren(SliderComponent) sliderComponents: QueryList<SliderComponent>;
    @ViewChildren(TableComponent) tableComponents: QueryList<TableComponent>;

    @ViewChildren(StringComponent) stringComponents: QueryList<StringComponent>;
    @ViewChildren(DropdownComponent) dropdownComponents: QueryList<DropdownComponent>;
    @ViewChildren(PasswordComponent) passwordComponents: QueryList<PasswordComponent>;


    // Code
    @ViewChildren(CodeComponent) codeComponents: QueryList<CodeComponent>;
  
    constructor(
      private myKernelSevice: KernelService,
      private myVariableService: VariableService,
      private myFileService: FileService,
      private elementRef: ElementRef
    ) { }

    onSubmit() {
      console.log('submitted')
    }
  
    ngAfterViewInit() {
      // Replace links
      let links: HTMLAnchorElement[] = Array.from(this.elementRef.nativeElement.getElementsByTagName("a"))
      this.myFileService.morphLinksToUpdateFile(links);

      this.formViewInitialised.resolve(null)

      this.variableComponents = this.variableComponents.concat(this.toggleComponents.toArray())
      this.variableComponents = this.variableComponents.concat(this.tickComponents.toArray())
      // this.variableComponents = this.variableComponents.concat(this.conditionalComponents.toArray())

      this.buttonComponents.toArray().forEach(buttonComponent => {
        if (buttonComponent.conditional) {
          this.variableComponents = this.variableComponents.concat([buttonComponent.conditionalComponent])
        }
      })

      // this.conditionalComponents.changes.subscribe(() => {
      //   console.log(this.conditionalComponents.toArray())
      // })
      // console.log(this.conditionalComponents.toArray())

      this.variableComponents = this.variableComponents.concat(this.numberComponents.toArray())
      this.variableComponents = this.variableComponents.concat(this.sliderComponents.toArray())
      this.variableComponents = this.variableComponents.concat(this.tableComponents.toArray())

      this.variableComponents = this.variableComponents.concat(this.stringComponents.toArray())
      this.variableComponents = this.variableComponents.concat(this.dropdownComponents.toArray())
      this.variableComponents = this.variableComponents.concat(this.passwordComponents.toArray())

      this.sectionComponents = this.sectionComponents.concat(this.startComponents.toArray())
      this.sectionComponents = this.sectionComponents.concat(this.liveComponents.toArray())
      this.sectionComponents = this.sectionComponents.concat(this.buttonComponents.toArray())
      this.sectionComponents = this.sectionComponents.concat(this.outputComponents.toArray())
      
      this.initialiseForm();
    }

  
    /**
     * Initialise the form. Code ordering during initialisation is defined here.
     */
    private initialiseForm() {
      // Only begin initialisation once the kernel is connected
      this.myKernelSevice.sessionConnected.promise.then(() => {
        console.log('Form initialisation')

        this.sectionComponents.forEach(sectionComponent => {
          sectionComponent.sessionId = sessionId;
        })
        this.variableComponents.forEach(variableComponent => {
          variableComponent.sessionId = sessionId;
        })

        // console.log('session connected');
        // console.log(this.startComponents);

        // The start component section is run first
        

        this.startComponents.toArray().forEach((startComponent, index) => {
          startComponent.setId(index);
          // startComponent.provideSections(
          //   this.liveComponents, this.buttonComponents);

          // Only run the code of a start component if it is a new session.
          // Once the data model for the form results has been built it can
          // be used to facilitate determining whether or not the code within
          // start component(s) have changed. If it has changed the code should
          // be re-run even if it isn't a new session.
          if (startComponent.always === '') {
            startComponent.runCode();
          } else if (this.myKernelSevice.sessionStore[sessionId].isNewSession) {
            startComponent.runCode();
          }
        });
        // this.myKernelSevice.isNewSession = false;

        // Variable components are initialised second
        this.myVariableService.resetVariableService(sessionId);
        
        this.variableComponents.forEach((variableComponent, index) => {
          variableComponent.initialise(index);
        })
        this.myVariableService.allVariablesInitilised(sessionId)
        // this.myVariableService.fetchAll()

        // Wait until the code queue is complete before declaring form ready to
        // the various components.
        this.myKernelSevice.sessionStore[sessionId].queue.then(() => {
          
          // Make all variables update whenever a code component finishes
          // running.
          // for (const codeComponent of this.codeComponents.toArray()) {
          //   codeComponent.aCodeRunCompleted.subscribe(() => {
          //     // this.myVariableService.fetchAll()
          //   });
          // }

          // Tell the live components that the form is ready
          this.liveComponents.toArray().forEach((liveComponent, index) => {
            liveComponent.setId(index);
            liveComponent.formReady();
          });

          // Tell the variable components that the form is ready
          this.variableComponents.forEach(variableComponent => {
            variableComponent.formReady();
          })

          // Tell the button components that the form is ready
          this.buttonComponents.toArray().forEach((buttonComponent, index) => {
            buttonComponent.setId(index);
            buttonComponent.formReady();
          });

          this.outputComponents.toArray().forEach((outputComponent, index) => {
            outputComponent.setId(index);
            outputComponent.formReady();
          });

          this.formReady.resolve(null)
        });
      });
    }
  }

  // The Angular module for the form component
  @NgModule(
    {
      imports: [
        CommonModule,
        FormsModule,
        MaterialModule,
        SectionsModule,
        VariablesModule,
        CodeModule
      ],  
      declarations: [
        FormComponent
      ]
    }
  )
  class FormComponentModule { }

  // Compile the template
  const module: ModuleWithComponentFactories<FormComponentModule> = (
    compiler.compileModuleAndAllComponentsSync(FormComponentModule));

  // Return the factory
  return module.componentFactories.find(
    f => f.componentType === FormComponent);
}