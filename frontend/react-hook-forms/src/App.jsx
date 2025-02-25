import { useEffect, useState } from 'react'
import './App.css'
import { useForm } from 'react-hook-form'

function App() {
  
  const {register, handleSubmit, watch, getValues, setValue, formState: {errors} } = useForm();
  
  function onSubmit(data){
    console.log('Submit', data)
  }
  //efectos es la union de una funcion y una dependencia
  useEffect(() => { 
    console.log('los valores actuales son: ',getValues())
  }, [watch(getValues())])

  useEffect(() => { 
    console.log("ha cambiado el campo 2")
  }, [watch("field2")])

  // se ejecuta cuando se pierde el foco
  const onBlur = (e) =>{
    setValue("field3", e.target.value)
  }

  //se ejecuta con cada cambio, puede ir donde esta el onBlur
  const onchange = (e) =>{
    setValue("field3", e.target.value)
  }

  return (

      <div className = 'App'>
        <form onSubmit={handleSubmit(onSubmit)}>
          <input {...register("field1", {onBlur: (e) => onBlur(e)})} /> <br></br>
          <input {...register("field2", {required:true})} /> <br></br>
          <input {...register("field3")} /> <br></br>
          {errors.field2 && <span>El campo es requerido</span>}
          <input type="submit" />
        </form>
        {JSON.stringify(getValues())}
      </div>

  )
}

export default App
