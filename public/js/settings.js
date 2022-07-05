const editableDesk = () => settings.querySelector('#editable-desk input').checked;
settings.querySelector('#private-desk input').checked = document.querySelector('.desk-type').textContent === '(private)';

function changeEditable() {
  Array
    .from(task_board.children)
    .forEach(el => {
      const inputs = el.querySelectorAll('input:not(.id)');
      if (editableDesk()) {
        inputs.forEach(input => {
          if (input.classList.contains('delete') || input.classList.contains('edit-task')) input.type = 'button';
          else input.disabled = false;
        });
        input_block.style.display = '';
      } else {
        inputs.forEach(input => {
          if (input.classList.contains('delete') || input.classList.contains('edit-task')) input.type = 'hidden';
          else input.disabled = true;
        });
        input_block.style.display = 'none';
      }
    });
  if (editableDesk()) input_block.style.display = '';
  else input_block.style.display = 'none';
}
changeEditable();

let editing = false;
let editingDesk;

document.querySelector('.desk-name').onclick = () => settings.classList.toggle('hide');
document.querySelector('.wrapper > .content').onclick = () => settings.classList.add('hide');

settings.querySelector('.desks input').onkeyup = e => {
  if (e.key === 'Enter') addDesk(e.target);
}
document.querySelector('.desks [type="button"]').onclick = () => addDesk(document.querySelector('.desks input'));

function addDesk(input) {
  const deskName = input.value;
  if (deskName.trim().length) {
    if (editing) {
      fetch(`/desks/${deskId}/title?value=${deskName}`, { method: 'PATCH', headers: { 'X-XSRF-TOKEN': csrf } })
        .then(() => {
          editingDesk.children[0].childNodes[0].textContent = deskName;
          settings.querySelector('.desks > ul').prepend(editingDesk);
          document.querySelector('.desk-name').childNodes[0].textContent = deskName + ' ';
          input.value = '';
        });
    } else {
      fetch(`/desks/new?title=${deskName}`, { method: 'POST', headers: { 'X-XSRF-TOKEN': csrf } })
        .then(res => res.json())
        .then(({ id, error }) => {
          if (error) throw new Error(error);
          const desk = document.createElement('li');
          desk.innerHTML = `<a class="desk" href="/desks/${id}">${deskName} (private)</a>`;
          const deleteBtn = document.createElement('input');
          deleteBtn.classList.add('delete-desk');
          deleteBtn.type = 'button';
          deleteBtn.value = 'delete';
          deleteBtn.onclick = () => deleteDeskHandler(desk, id);
          desk.appendChild(deleteBtn);
          settings.querySelector('.desks > ul').appendChild(desk);
          input.value = '';
        });
    }
  }
}

settings.querySelector('.edit-desk').onclick = () => {
  editingDesk = settings.querySelector('.desks li');
  settings.querySelector('.desks ul').removeChild(editingDesk);
  settings.querySelector('.desks input').value = editingDesk.children[0].childNodes[0].textContent;
  editing = true;
};

const privateSetting = document.getElementById('private-desk');
const editableSetting = document.getElementById('editable-desk');

privateSetting.onclick = (e) => {
  const input = privateSetting.querySelector('input');
  if (e.target !== input) input.checked = !input.checked;
  const { checked } = input;
  fetch(`/desks/${deskId}/private?value=${checked}`, { method: 'PATCH', headers: { 'X-XSRF-TOKEN': csrf } })
    .then(res => res.json())
    .then(({ error }) => {
      if (error) throw new Error(error);
      settings.querySelector('.desks li span').textContent =
        document.querySelector('.desk-type').textContent =
        `(${checked ? 'private' : 'public'})`;
    });
};

editableSetting.onclick = (e) => {
  const input = editableSetting.querySelector('input');
  if (e.target !== input) input.checked = !input.checked;
  const { checked } = input;
  fetch(`/desks/${deskId}/editable?value=${checked}`, { method: 'PATCH', headers: { 'X-XSRF-TOKEN': csrf } })
    .then(res => res.json())
    .then(({ error }) => {
      if (error) throw new Error(error);
      changeEditable();
    });
}

settings.querySelectorAll('.delete-desk')
  .forEach(el => el.onclick = () => deleteDeskHandler(el.parentElement, el.previousElementSibling.href.split('/').slice(-1)));

settings.querySelector('.delete-desk').onclick = async () => {
  await deleteDeskHandler(settings.querySelector('.delete-desk').parentElement, document.querySelector('.delete-desk').parentElement.firstElementChild.href.split('/').slice(-1));
  location.href = 'http://localhost:3000/';
}
function deleteDeskHandler(desk, id) {
  return new Promise(res => {
    fetch(`/desks/${id}`, { method: 'DELETE', headers: { 'X-XSRF-TOKEN': csrf } })
      .then(res => res.json())
      .then(({ error }) => {
        if (error) throw new Error(error);
        settings.querySelector('.desks ul').removeChild(desk);
        res();
      });
  })
} 