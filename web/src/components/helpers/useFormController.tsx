import React, {useState, useEffect} from 'react'
import Input from '../toolbox/form/Input'
/*
useFormController → a custom hook which handles the DOM representation of
an active form, the input field types, errors and events b/w form and user
*/

interface IInputConfig {
  type?: 'text' | 'password'
  onChange?: (arg0: string) => void
  label: string
}

interface IFormInput {
  key: string
  type: 'input' | 'checkbox' // todo: add more
  config: IInputConfig | any // todo: create config types for each input type: e.g IInputFidlConfig, ICheckboxConfig
}

const useFormController = ({ formConfig }: { formConfig: IFormInput [] }) => {

  /*
  renderForm ()
  Based on the configuration of the form, create a DOM representation of the
  form that users can interact with.
  */
  const renderForm = (): React.ReactFragment => {

    const formDOM: any[] = []

    // check each form input description and create its DOM representation
    for (let i = 0; i < formConfig.length; ++i) {

      switch(formConfig[i].type) {
        case 'input':

          let config: IInputConfig = (formConfig[i].config as IInputConfig)

          formDOM.push(<div className="padded upper">
            <Input 
              type={config.type ? config.type : 'text'} 
              label={config.label}
              onChange={config.onChange}
            />
          </div>)
          break;
        case 'checkbox':
          break;
      }

    }

    return (<React.Fragment>
      {formDOM}
    </React.Fragment>)
  }

  return (<div>{renderForm()}</div>)
}

export {useFormController}