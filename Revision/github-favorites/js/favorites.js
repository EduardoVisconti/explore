import { GithubUser } from "./GithubUser.js"

//classe q vai conter a lógica dos dados
//como os dados serão estruturados
export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root)
    this.load()

    GithubUser.search('eduardovisconti').then(user => console.log(user))
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || []
  }

  save() {
    localStorage.setItem('@github-favorites:', JSON.stringify(this.entries)) //transforma o objeto em string
  }

  async add(username) {
    try {
      const userExists = this.entries.find(entry => entry.login === username)
      if (userExists) {
        throw new Error('Usuário já cadastrado')
      }

      const user = await GithubUser.search(username)

      if (user.login === undefined) {
        throw new Error('Usuário não encontrado!')
      }

      this.entries = [user, ...this.entries] //NOVO ARRAY. primeiro vai colocar o usuário, e todos os outros abaixo/espalhado
      this.update()
      this.save()
    } catch (error) {
      alert(error.message)
    }
  }

  delete(user) {
    const filteredEntries = this.entries.filter(
      entry => entry.login !== user.login
    ) //se for diferente, mantém

    this.entries = filteredEntries //novo array
    this.update()
    this.save()
  }
}

//classe q vai criar a visualização e eventos do HTML
export class FavoritesView extends Favorites {
  constructor(root) {
    super(root) //div app

    this.tbody = this.root.querySelector('table tbody')

    this.update()
    this.onadd()
  }

  onadd() {
    const addButton = this.root.querySelector('.search button')
    addButton.onclick = () => {
      const { value } = this.root.querySelector('.search input')

      this.add(value)
    }
  }

  update() {
    this.removeAllTr()

    this.entries.forEach(user => {
      //para cada usuário
      const row = this.createRow()

      row.querySelector('.user img').src = `https://github.com/${user.login}.png`
      row.querySelector('.user img').alt = `Imagem de ${user.name}`
      row.querySelector('.user a').href = `https://github.com/${user.login}`
      row.querySelector('.user p').textContent = user.name
      row.querySelector('.user span').textContent = user.login
      row.querySelector('.repositories').textContent = user.public_repos
      row.querySelector('.followers').textContent = user.followers

      row.querySelector('.remove').onclick = () => {
        const isOk = confirm('Tem certeza que deseja deletar essa linha?')
        if (isOk) {
          this.delete(user)
        }
      }

      this.tbody.append(row)
    })
  }

  createRow() {
    const tr = document.createElement('tr')

    tr.innerHTML = `
            <td class="user">
              <img
                src="https://github.com/maykbrito.png"
                alt="Imagem de maykbrito"
              />
              <a href="https://github.com/maykbrito" target="_blank">
                <p>Mayk Brito</p>
                <span>maykbrito</span>
              </a>
            </td>
            <td class="repositories">76</td>
            <td class="followers">9589</td>
            <td>
              <button class="remove">&times;</button>
            </td>
      
    `
    return tr //retorna o tr para usar em cada elemento
  }

  removeAllTr() {
    this.tbody.querySelectorAll('tr').forEach(tr => {
      tr.remove()
    })
  }
}
