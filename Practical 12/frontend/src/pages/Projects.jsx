import { useState, useEffect } from "react";

function Projects() {
    const [repos, setRepos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        fetch("https://api.github.com/users/Gauravk6531/repos")
            .then((response) => {
                if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
                return response.json();
            })
            .then((data) => setRepos(data))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div>Loading repos...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <section>
            <h2>Projects</h2>
            <ul>
                {repos.map((repo) => (
                    <li key={repo.id}>
                        <a href={repo.html_url} target="_blank" rel="noreferrer">
                            {repo.name}
                        </a>
                        {repo.description && <p>{repo.description}</p>}
                    </li>
                ))}
            </ul>
        </section>
    );
}

export default Projects;