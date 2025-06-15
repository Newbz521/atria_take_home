import { useState } from 'react'
import './App.css'

function App() {
  const [inputValue, setInputValue] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult('');
    // console.log("FETCHING")
    try {
      const res = await fetch('http://localhost:3000/query', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ query: inputValue }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setResult(data.result || data.error || 'No response received.');
    } catch (err) {
      console.error('Fetch error:', err);
      setResult('Failed to get response from server.');
    } finally {
      setLoading(false);
    }
    console.log(result)
  };

  return (
    <>
     <div className="w-full h-full gap-4 flex-col sm:flex-row flex justify-center text-black items-center bg-[linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(250,237,233,1)_50%,rgba(255,255,255,1)_100%)]">
      <nav className="w-full h-1/12 flex justify-center items-center fixed top-[25px] left-0 right-0 bg-white z-10 border-y-[5px] border-gray-200 border-double">
        <h1 className="text-3xl font-bold mb-2 text-black">atria</h1>
      </nav>
      <div className="flex flex-col gap-4 w-5/6 sm:w-full max-w-[500px] p-6 h-1/3 sm:h-1/2 border border-[#f4dcd5] rounded-3xl bg-white">
        <h1 className="text-2xl font-bold mb-2 text-[#c24b29]">Zoning Information Query</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label htmlFor="myInput" className="text-lg font-semibold">
            Enter Text:
          </label>
          <input
            type="text"
            id="myInput"
            value={inputValue}
            onChange={handleChange}
            className="border rounded-full px-4 py-2 text-lg shadow-sm focus:outline-none border-slate-300"
            placeholder="Type your zoning question..."
          />
          <button
            type="submit"
            className="bg-[#c24b29] text-white w-fit py-2 px-4 rounded-lg hover:bg-[#E35336] transition-all duration-300"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button>
          </form>
          
        <div>
          {/* <h2 className="text-lg font-semibold mt-4">Result:</h2>
          <pre id="result" className="bg-gray-400 p-3 rounded whitespace-pre-wrap">
            {result}
          </pre> */}
        </div>
        </div>
        

        <div className="flex flex-col gap-4 w-5/6 sm:w-full max-w-[500px] p-6 h-1/3 sm:h-1/2 border border-[#f4dcd5] rounded-3xl bg-white">
        <h1 className="text-2xl font-bold mb-2 text-[#c24b29]">Results: </h1>
          <div className="w-full h-full border-y-2 whitespace-pre-wrap overflow-y-scroll">

            <div className="w-full h-fit whitespace-pre-wrap">
              {result}
            </div>
          </div>
      </div>
    </div>
    </>
  )
}

export default App
