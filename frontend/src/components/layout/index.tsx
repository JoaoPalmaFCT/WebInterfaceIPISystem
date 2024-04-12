import { ReactNode } from 'react'

interface BannerProps {
    title: string
}
export const Banner = ({ title }: BannerProps) => <div>{ title }</div>

const headerStyle = { backgroundColor: '#0ea5e9', padding: '20px' }
export const Header = (props: { title:string, children: ReactNode }) =>
    <header style={headerStyle}>
        <Banner title={props.title}/>
        {props.children}
    </header>

const containerStyle = { flex: 1}
export const Container = (props: { children?: ReactNode }) => <div style={containerStyle}>{ props.children }</div>
export const Footer = () => <footer style={{height: '50px', backgroundColor: '#333', color: 'white',textAlign: 'center', paddingTop: '15px'}}>
    © Lincs
</footer>