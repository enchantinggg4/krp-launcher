import { computed, makeAutoObservable, observable } from 'mobx'
import { Config } from '../../../electron/Config.manager'
import { Stats } from 'node-downloader-helper'
import { create } from 'apisauce'
import jwtDecode from 'jwt-decode'
import {NotificationContainer, NotificationManager} from 'react-notifications';
export enum Faction {
  DWARF = 'DWARF',
  HUMAN = 'HUMAN',
  ELF = 'ELF',
  WILD = 'WILD',
}
export const FactionName: Record<Faction, string> = {
  [Faction.DWARF]: 'Гном',
  [Faction.WILD]: 'Дикарь',
  [Faction.ELF]: 'Эльф',
  [Faction.HUMAN]: 'Человек',
}

export const SkillName: Record<string, string> = {
  LUMBERJACK: 'Древоруб',
  MINER: 'Шахтер',

  SMITH: 'Кузнец',
  CARPENTER: 'Плотник',
  ENGINEER: 'Инженер',

  FARMER: 'Фермер',
  FISHER: 'Рыбак',
  COOK: 'Повар',

  WARRIOR: 'Воин',
  ARCHER: 'Лучник',

  ALCHEMIST: 'Алхимик',
  ENCHANTER: 'Чародей',
}

export class SkillLevelDTO {
  skill!: string
  level!: number
}

export class ProfileDTO {
  profile!: {
    username: string
    id: string
    fraction: Faction
  }
  skills!: SkillLevelDTO[]
}

class LayoutStore {
  api = create({
    baseURL: 'http://5.101.50.157:3300',
    // baseURL: 'http://localhost:3300',
  })

  @observable
  error?: string

  @computed
  get username(): string {
    return this.config?.username || ''
  }

  @computed
  get password(): string {
    return this.config?.password || ''
  }

  @computed
  get rulesAccepted(): boolean {
    return !!this.config?.rulesAccepted
  }

  @observable
  token?: string

  @observable
  version: string = ''

  @observable
  onlineCount: number = 0

  @observable
  maxOnlineCount: number = 0

  @observable
  config?: Config

  @observable
  updateStatus = {
    updated: false,
    totalUpdates: 0,
    downloaded: 0,
    minecraftDownloaded: false,
  }

  @observable
  unzipStatus?: {
    percentage: number
  }

  @observable
  private downloadStatus?: Stats

  @observable
  profile?: ProfileDTO

  @computed
  get canLogin(): boolean {
    return !this.usernameError && !this.passwordError
  }

  @computed
  get usernameError(): string | undefined {
    if (this.username.length < 3 || this.username.length > 16) {
      return 'Никнейм должен быть от 3 до 16 символов'
    }

    const r = RegExp(/^[a-zA-Z0-9_]{2,16}$/gm)

    if (!r.test(this.username)) {
      return 'Только английский буквы и цифры'
    }
  }

  @computed
  get passwordError(): string | undefined {
    if (this.password.length < 5 || this.password.length > 16) {
      return 'Пароль должен быть от 5 до 16 символов'
    }
  }

  get tokenUsername(): string | undefined {
    if (this.token) return (jwtDecode(this.token) as any).sub
  }

  constructor() {
    makeAutoObservable(this)

    window.Main.on('online', (data: any) => {
      this.onlineCount = data.online
      this.maxOnlineCount = data.max
    })

    window.Main.on('update_config', (data: Config) => {
      this.config = data
      this.token = data.token

      this.api.setHeader('Authorization', `Bearer ${data.token}`)
      this.loadMe()
    })

    window.Main.on('version', (data: string) => {
      this.version = data
      console.log('Received version')
    })

    window.Main.on('download_progress', (data: Stats) => {
      console.log('DownloadStatus received')
      this.downloadStatus = data
    })

    window.Main.on('unzip_status', (data: any) => {
      this.unzipStatus = data
    })

    window.Main.on('update_status', (data: any) => {
      console.log('Status update', data)
      this.updateStatus = data
    });

    window.Main.on('update-downloaded', (data: any) => {
      NotificationManager.success("Перезапусти лаунчер.", "Обновление скачено!",);
    })

    window.Main.on('update-available', (data: any) => {
      NotificationManager.info("Доступно обновление, скачиваю...",);
    })

    
    
  }

  init() {
    setInterval(() => {
      this.ping()
    }, 10_000)
    this.ping()
    window.Main.sendMessage({ type: 'init' })
  }

  async ping() {
    window.Main.sendMessage({ type: 'ping' })
    window.Main.sendMessage({ type: 'get_version' })
  }

  setUsername(username: string) {
    if (this.config) this.config.username = username
    window.Main.sendMessage({
      type: 'update_username',
      username,
    })
    this.error = undefined
  }

  setPassword(password: string) {
    if (this.config) this.config.password = password
    window.Main.sendMessage({
      type: 'update_password',
      password,
    })
    this.error = undefined
  }

  setToken(token: string) {
    this.token = token
    this.api.setHeader('Authorization', `Bearer ${token}`)
    window.Main.sendMessage({
      type: 'update_token',
      token,
    })
    this.error = undefined
  }

  async launchGame() {
    window.Main.sendMessage({ type: 'launch' });
  }

  onUpdateButton() {
    // check if we are up to date
    window.Main.sendMessage({ type: 'reinstall' })
  }

  onAcceptRules() {
    window.Main.sendMessage({ type: 'accept_rules' })
  }

  getUpdateStatus() {
    // console.log(this.updateStatus, this.downloadStatus)
    if (this.updateStatus.updated) {
      return 'Все файлы обновлены.'
    } else if (this.updateStatus.totalUpdates > 0) {
      return `Установка ${this.updateStatus.downloaded}/${this.updateStatus.totalUpdates}`
    } else if (this.downloadStatus) {
      return `Скачивание ${this.downloadStatus?.progress.toFixed(1)}%`
    } else if (this.unzipStatus) {
      return `Разархивирование ${this.unzipStatus.percentage.toFixed(1)}%`
    } else {
      return 'Идет установка...'
    }
  }

  async register() {
    const res = await this.api.post<{ access_token: string }>(
      '/auth/register',
      {
        username: this.username,
        password: this.password,
      }
    )

    if (res.ok) {
      await this.setToken(res.data!!.access_token)
      this.error = undefined
      await this.loadMe()
    } else {
      this.error = 'Никнейм занят'
    }
  }

  async login() {
    const res = await this.api.post<{ access_token: string }>('/auth/login', {
      username: this.username,
      password: this.password,
    })
    if (res.ok) {
      await this.setToken(res.data!!.access_token)
      this.error = undefined
      await this.loadMe()
    } else {
      this.error = 'Неправильный логин/пароль'
    }
  }

  async choseFaction(faction: Faction) {
    const res = await this.api.post<ProfileDTO>('/auth/faction', {
      faction,
    })
    if (res.ok) {
      await this.handleProfile(res.data!!)
    }
  }

  private async handleProfile(profile: ProfileDTO) {
    this.profile = profile
  }

  async loadMe() {
    await this.api.get<ProfileDTO>('/auth/me').then(it => {
      if (it.ok) {
        this.handleProfile(it.data!!)
      } else {
        this.logout()
      }
    })
  }

  private logout() {
    this.token = undefined
    this.api.deleteHeader('Authorization')
    window.Main.sendMessage({
      type: 'update_token',
      token: undefined,
    })
  }

  updateConfig(param: Partial<Config>) {
    Object.entries(param).forEach(([k, v]) => {
      (this.config as any)[k] = v;

      (param as any)[k] = (param as any)[k] === undefined ? null : v;
    })

    window.Main.sendMessage({
      type: 'update_config',
      partial: param,
    })
  }
}

export default new LayoutStore()
