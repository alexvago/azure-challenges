
import { getResources } from "./actions/actions";
import styles from "./page.module.css";

export default async function Home() {

  const resources = await getResources();
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Accounting dashboard</h1>

        <h3>Resources produced</h3>

        <table style={{textAlign: "center"}}>
          <thead>
            <tr>
              <th>Resource</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(resources).map((resource, i) => (
              <tr key={`${resource[0]}-${i}`}>
                <td>{resource[0]}</td>
                <td>{resource[1]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
      <footer className={styles.footer}>
       
      </footer>
    </div>
  );
}
