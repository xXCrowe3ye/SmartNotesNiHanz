import {
  HashRouter as Router,
  Route,
} from "react-router-dom";

import './App.css';
import Header from './components/Header'
import NotesListPage from './pages/NotesListPage'
import NotesPage from './pages/NotesPage'
import Footer from './pages/Footer'


function App() {
  return (
    <Router>
      <div className="container dark">
        <div className="app">
          <Header />
          <Route path="/" exact component={NotesListPage} />
          <Route path="/notes/:id" component={NotesPage} />
          <Footer />

        </div>
      </div>
    </Router> 
  );
}

export default App;
