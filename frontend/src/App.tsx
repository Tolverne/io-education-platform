import { Authenticator } from "@aws-amplify/ui-react";
import "./App.css";

export default function App() {
    return (
        <Authenticator>
            {({ signOut, user }) => (
                <main className="app-shell">
                    <section className="hero">
                        <h1>IO Education</h1>
                        <p>Teacher dashboard</p>

                        <div className="card">
                            <h2>Signed in</h2>
                            <p>{user?.signInDetails?.loginId ?? user?.username}</p>
                        </div>

                        <div className="actions">
                            <button onClick={signOut}>Sign out</button>
                        </div>
                    </section>
                </main>
            )}
        </Authenticator>
    );
}