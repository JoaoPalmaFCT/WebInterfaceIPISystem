import {
    useState
} from "react";

function Login() {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        console.log("Email:", email);
        console.log("Password:", password);
    };

    return (
        <div
            className="full-screen" style={{paddingTop: '20px'}}>
        <div
            className="login-container">
            <h2 className="login-title">Login</h2>
            <form
                onSubmit={handleLogin}
                className="login-form">
                <div
                    className="input-group-login">
                    <label
                        htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div
                    className="input-group-login">
                    <label
                        htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="login-button">Login
                </button>
            </form>
        </div>
        </div>
    );
}

export default Login;