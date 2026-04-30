import { Form, getAllFormFields } from '@igo2/common/form';

export function formToJSON (elements: Form) {
    return [].reduce.call(
        getAllFormFields(elements),
        (data: { [x: string]: any; }, element: { name: string | number; control: { value: any; }; }) => {
          data[element.name] = element.control.value;
          return data;
        },
        {},
    );
}
