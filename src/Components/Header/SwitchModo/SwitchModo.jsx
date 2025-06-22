import './SwitchModo.css'

function SwitchModo() {

    return (
      <>
        <div class="toggle-switch">
    <input type="checkbox" id="toggle"/>
    <label for="toggle" class="toggle-label">
      <span class="slider">
        <span class="ray top"></span>
        <span class="ray left"></span>
        <span class="ray bottom"></span>
      </span>
    </label>
  </div>
      </>
    )
  }
  
  export default SwitchModo