import About from "./About";
import Skills from "./Skills";

function Home() {
  const skills = ["React", "JavaScript", "Python", "Machine Learning", "SQL", "Git"];

  return (
    <section className="page-section">
      <About college="CHARUSAT University" />
      <Skills skillList={skills} />
    </section>
  );
}

export default Home;
