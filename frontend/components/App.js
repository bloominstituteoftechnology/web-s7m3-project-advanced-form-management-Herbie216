import React, { useState, useEffect } from 'react'
import axios from 'axios';
import * as yup from 'yup'

const e = {
  usernameRequired: 'username is required',
  usernameMin: 'username must be at least 3 characters',
  usernameMax: 'username cannot exceed 20 characters',
  favLanguageRequired: 'favLanguage is required',
  favLanguageOptions: 'favLanguage must be either javascript or rust',
  favFoodRequired: 'favFood is required',
  favFoodOptions: 'favFood must be either broccoli, spaghetti or pizza',
  agreementRequired: 'agreement is required',
  agreementOptions: 'agreement must be accepted',
}

const validationSchema = yup.object().shape({
  username: yup
    .string().trim()
    .required(e.usernameRequired)
    .min(3, e.usernameMin)
    .max(20, e.usernameMax),
  favLanguage: yup
    .string()
    .required(e.favLanguageRequired).trim()
    .oneOf(['javascript', 'rust'], e.favLanguageOptions),
  favFood: yup
    .string()
    .required(e.favFoodRequired).trim()
    .oneOf(['broccoli', 'spaghetti', 'pizza'], e.favFoodOptions),
  agreement: yup
    .boolean()
    .required(e.agreementRequired)
    .oneOf([true], e.agreementOptions),
});

const getInitialValues = () => ({
  username: '',
  favLanguage: '',
  favFood: '',
  agreement: false,
});

const getInitialErrors = () => ({
  username: '',
  favLanguage: '',
  favFood: '',
  agreement: '',
});

export default function App() {
  const [values, setValues] = useState(getInitialValues());
  const [errors, setErrors] = useState(getInitialErrors());
  const [serverSuccess, setServerSuccess] = useState('');
  const [serverFailure, setServerFailure] = useState('');
  const [formEnabled, setFormEnabled] = useState(false)

  useEffect(() => {
    validationSchema.isValid(values).then(setFormEnabled)
  }, [values])

  const onChange = (evt) => {
    const { name, type, checked } = evt.target;
    const inputValue = type === 'checkbox' ? checked : evt.target.value;
    const finalValue = name === 'agreement' ? checked : inputValue;

    setValues({ ...values, [name]: finalValue });
    yup.reach(validationSchema, name).validate(finalValue)
      .then(() => setErrors({ ...errors, [name]: '' }))
      .catch((err) => setErrors({ ...errors, [name]: err.errors[0] }));
  };

  const onSubmit = (evt) => {
    evt.preventDefault();
    axios.post('https://webapis.bloomtechdev.com/registration', values)
      .then((res) => {
        setValues(getInitialValues())
        setServerSuccess(res.data.message)
        setServerFailure()
      })
      .catch((err) => {
        setServerFailure(err.response.data.message);
        setServerSuccess()
      });
  };

  return (
    <div>
      <h2>Create an Account</h2>
      <form onSubmit={onSubmit} >
        {serverSuccess && <h4 className="success">{serverSuccess}</h4>}
        {serverFailure && <h4 className="error">{serverFailure}</h4>}

        <div className="inputGroup">
          <label htmlFor="username">Username:</label>
          <input value={values.username} onChange={onChange} id="username" name="username" type="text" placeholder="Type Username" />
          {errors.username && <div className="validation">{errors.username}</div>}
        </div>

        <div className="inputGroup">
          <fieldset>
            <legend>Favorite Language:</legend>
            <label>
              <input checked={values.favLanguage == 'javascript'} onChange={onChange} type="radio" name="favLanguage" value="javascript" />
              JavaScript
            </label>
            <label>
              <input checked={values.favLanguage == 'rust'} onChange={onChange} type="radio" name="favLanguage" value="rust" />
              Rust
            </label>
          </fieldset>
          {errors.favLanguage && <div className="validation">{errors.favLanguage}</div>}
        </div>

        <div className="inputGroup">
          <label htmlFor="favFood">Favorite Food:</label>
          <select value={values.favFood} onChange={onChange} id="favFood" name="favFood">
            <option value="">-- Select Favorite Food --</option>
            <option value="pizza">Pizza</option>
            <option value="spaghetti">Spaghetti</option>
            <option value="broccoli">Broccoli</option>
          </select>
          {errors.favFood && <div className="validation">{errors.favFood}</div>}
        </div>

        <div className="inputGroup">
          <label>
            <input checked={values.agreement} onChange={onChange} id="agreement" type="checkbox" name="agreement" />
            Agree to our terms
          </label>
          {errors.agreement && <div className="validation">{errors.agreement}</div>}
        </div>

        <div>
          <input disabled={!formEnabled} type="submit" />
        </div>
      </form>
    </div>
  )
}
