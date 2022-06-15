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
      fetch(`updatePreference/title/${deskId}?title=${deskName}`, { method: 'POST' })
        .then(() => {
          editingDesk.children[0].childNodes[0].textContent = deskName;
          settings.querySelector('.desks > ul').prepend(editingDesk);
          document.querySelector('.desk-name').childNodes[0].textContent = deskName + ' ';
          input.value = '';
        });
    } else {
      fetch(`create?deskTitle=${deskName}`, { method: 'POST' })
        .then(res => res.json())
        .then(({ id }) => {
          const desk = document.createElement('li');
          desk.innerHTML = `<a class="desk" href=${id}>${deskName} (private)</a>`;
          const deleteBtn = document.createElement('input');
          deleteBtn.classList.add('delete-desk');
          deleteBtn.type = 'button';
          deleteBtn.value = 'delete';
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

Array.from(settings.querySelector('.desk-settings').children)
  .forEach(preference => {
    preference.onclick = e => {
      const input = preference.querySelector('input');
      if (e.target !== input) input.checked = !input.checked;
      const { id } = preference;
      const { checked } = input;
      fetch(`/updatePreference/${id}/${deskId}?checked=${checked}`, { method: 'POST' })
        .then(() => {
          if (id === 'private-desk') {
            settings.querySelector('.desks li span').textContent = ` (${checked ? 'private' : 'public'})`;
            document.querySelector('.desk-type').textContent = `(${checked ? 'private' : 'public'})`;
          } else changeEditable();
        });
    }
  });

settings.querySelectorAll('.delete-desk')
  .forEach(el => el.onclick = () => deleteDeskHandler(el.parentElement, el.previousElementSibling.href.split('/').slice(-1)));

settings.querySelector('.delete-desk').onclick = () => {
  location.href = 'http://localhost:3000/';
  deleteDeskHandler(settings.querySelector('.delete-desk').parentElement, location.href.split('/').slice(-1));
}
function deleteDeskHandler(desk, id) {
  fetch(`/updatePreference/delete/${id}`, { method: 'DELETE' })
    .then(() => {
      settings.querySelector('.desks ul').removeChild(desk);
    });
} 