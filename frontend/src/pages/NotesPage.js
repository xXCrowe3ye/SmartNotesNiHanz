import { useState, useRef, useEffect } from "react";
import { SSE } from "sse";
import { ReactComponent as ArrowLeft } from '../assets/arrow-left.svg'
import { ReactComponent as ChatGPTIcon } from '../assets/chatgpt.svg'
import { ReactComponent as TrashIcon } from '../assets/trash.svg'
const LanguageDetect = require('languagedetect');

const NotesPage = ({match, history}) => {
  let [isLoading, setIsLoading] = useState(false);
  let [result, setResult] = useState("");

  const resultRef = useRef();

  useEffect(() => {
    resultRef.current = result;
  }, [result]);

  let noteID = match.params.id
  let [note, setNote] = useState("")

  useEffect(() => {
    resultRef.current = result;
    getNote()
  }, [noteID])

  let getNote = async() => {
    if(noteID === 'new') return
    let response = await fetch(`/api/notes/${noteID}`)
    let data = await response.json()
    //console.log('DATA:',data['content'])
    setNote(data)
  }

  let createNote = async() => {
    fetch(`/api/notes/`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(note)
    })
  } 

  let updateNote = async() => {
    fetch(`/api/notes/${noteID}/`, {
      method: "PUT",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(note)
    })
  }

  let deleteNote = async() => {
    fetch(`/api/notes/${noteID}/`, {
      method: "DELETE",
      headers: {
        'Content-Type': 'application/json'
      },
    })
    history.push('/')
  }

let ChatGPT= async () => {
    let prompt = note.content + "return the results in bulleted form. Make it comprehensive and detailed."
    let API_response = await fetch(`/api/OpenAI_API`)
    const API_KEY = await API_response.json()
    let originalNote = "ChatGPT response:\n"
    if (prompt !== "") {
      setIsLoading(true);
      setResult("");
      let url = "https://api.openai.com/v1/chat/completions";
      let data = {
        model: "gpt-3.5-turbo",
        messages: [{role: "user", content: prompt}],
        stream: true,
      };

      let source = new SSE(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        method: "POST",
        payload: JSON.stringify(data),
      });

      source.addEventListener("message", (e) => {
        if (e.data !== "[DONE]") {
          let payload = JSON.parse(e.data);
          let text = payload.choices[0].delta.content;
          if (text !== undefined) {
            resultRef.current = resultRef.current + text;
            //console.log("ResultRef.current: " + resultRef.current);
            setResult(resultRef.current);
            note.content = resultRef.current + "\n SmartNotes by Hanz Bernabe"
          }
        } else {
          source.close();
        }
      });

      source.addEventListener("readystatechange", (e) => {
        if (e.readyState >= 2) {
          setIsLoading(false);
        }
      });

      source.stream();
    } else {
      alert("For ChatGPT to work, you need to write in the note body!");
    }
  };

  let handleSubmit =() => {
   //console.log(note)
   if(noteID !== 'new' && note.content === ''){
      deleteNote()
    }else if(noteID !== 'new'){
      updateNote()
    }else if(noteID === 'new' && note.content !== null){
        createNote()
    }
    history.push('/')
  }

  function textContentDirection(dir){
    const lngDetector = new LanguageDetect();
    let text = ""
    text = lngDetector.detect(dir)
    //console.log(text)
    if(0 !== text.length && 'arabic' === text[0][0]){
    return 'rtl' 
    }else{
      return 'ltr'
    }
  }

  return (
    <div className='note'>
      <div className='note-header'>
        <h3>
            <ArrowLeft onClick={handleSubmit}/>
        </h3>
        <h3>
        <input dir={textContentDirection(note?.title)} placeholder='Note Title' onChange={(e) => {setNote({...note, 'title':e.target.value})}} defaultValue={note?.title}></input>
        </h3>
             {noteID !== 'new' ? (
              <TrashIcon className="delete-floating-button" onClick={deleteNote}></TrashIcon>
             ):(
                <button onClick={handleSubmit}>Add</button>
             )}
      </div>
       <textarea dir={textContentDirection(note?.content)} textarea placeholder='Note body...' className='textarea' onChange={(e) => {setNote({...note, 'content':e.target.value})}} value={note?.content}></textarea>
      <div>
          <ChatGPTIcon className="floating-button" onClick={ChatGPT}></ChatGPTIcon>
      </div>
    </div>
  )
}

export default NotesPage
