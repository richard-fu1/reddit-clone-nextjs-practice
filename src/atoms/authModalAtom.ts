import { atom } from 'recoil'

export interface IAuthModalState {
  open: boolean
  view: 'login' | 'signup' | 'resetPassword'
}

const defaultModalState: IAuthModalState = {
  open: false,
  view: 'login',
}

export const authModalState = atom<IAuthModalState>({
  key: 'authModalState',
  default: defaultModalState,
})
