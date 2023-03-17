import { useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import { parse, stringify } from "yaml";
import YAML from "yaml";
import { useCSVReader } from "react-papaparse";
import { CSVLink } from "react-csv";

const csvData = [
  ["TABLE_NAME", "FIELD_NAME", "DESCRIPTIVE_NAME"],
  ["DFKKINVDOC_H", "MANDT", "Client"],
  ["DFKKINVDOC_H", "INVDOCNO", "Invoic. Doc."],
  ["DFKKINVDOC_H", "APPLK", "ApplicationArea"],
];

// Vars
var result = "";
var yamlInput = "";

function App() {
  const [count, setCount] = useState(0);
  const [mapping, setMapping] = useState(null);

  const [inputYAML, setInputYAML] = useState("");
  const [outputYAML, setOutputYAML] = useState("");

  const { CSVReader } = useCSVReader();

  const processYAML = () => {
    // Read YAML input - WORKING
    const yamlInputParsed = YAML.parse(inputYAML);

    // Create a mutable copy of the YAML
    const yamlOutputParsed = yamlInputParsed;

    console.log(yamlInputParsed);

    // Read Mapping CSV
    const reader = new FileReader();
    reader.onload = () => {
      document.getElementById("out").innerHTML = reader.result;
      result = reader.result;
    };
    console.log(mapping.data);

    // Update the YAML
    for (const i in mapping.data) {
      //console.log(`${i}: ${mapping.data[i]}`);
      // Find table name

      var foundTable = -2;
      var foundField = -2;

      foundTable = yamlInputParsed.records.findIndex(
        (x) => x.id == mapping.data[i][0]
      );

      // If table found
      if (foundTable > -1) {
        foundField = yamlInputParsed.records[foundTable].attributes.findIndex(
          (x) => x.id == mapping.data[i][1]
        );
      }

      // If table found, but no field defined
      if (foundTable > -1 && foundField == -1) {
        yamlOutputParsed.records[foundTable].attributes.push({
          id: mapping.data[i][1],
          displayName: mapping.data[i][2],
          customAttributes: {},
          pql: '"' + mapping.data[i][0] + '"."' + mapping.data[i][1] + '"',
          //type: "ATTRIBUTE",
        });
        console.log("this ran");
      }

      // If table found, and field defined
      if (foundTable > -1 && foundField > -1) {
        yamlOutputParsed.records[foundTable].attributes[
          foundField
        ].displayName = "_EDITED__" + mapping.data[i][2];
      }
    }
    setOutputYAML(YAML.stringify(yamlOutputParsed));
  };

  return (
    <div className="App">
      <div id="container">
        <h1>Celonis Knowledge Model Data Mapper</h1>

        <div>
          <h2>1. Select your mapping file:</h2>
          <p>
            Your CSV should have three columns: Table Name, Field Name,
            Descriptive Field Name. Here's a{" "}
            <CSVLink data={csvData}>Template with some example data</CSVLink>
          </p>
          <CSVReader
            onUploadAccepted={(results) => {
              console.log("---------------------------");
              console.log(results);
              setMapping(results);
              console.log("---------------------------");
            }}
          >
            {({
              getRootProps,
              acceptedFile,
              ProgressBar,
              getRemoveFileProps,
            }) => (
              <>
                <div>
                  <button type="button" {...getRootProps()}>
                    Browse file
                  </button>
                  <div>{acceptedFile && acceptedFile.name}</div>
                </div>
                <ProgressBar />
              </>
            )}
          </CSVReader>
        </div>

        <div className="two-col">
          <div className="col">
            <h2>2. Paste your knowledge model .YAML here</h2>
            <form>
              <textarea
                id="yaml_input_field"
                style={{ width: "95%", height: "40vh" }}
                onChange={(e) => setInputYAML(e.target.value)}
              ></textarea>
            </form>
          </div>
          <div className="col">
            <h2>3. Output will appear here:</h2>
            <form>
              <textarea
                id="yaml_output_field"
                style={{ width: "95%", height: "40vh" }}
                value={outputYAML}
                readOnly
              ></textarea>
            </form>
          </div>
        </div>

        <div>
          <button onClick={processYAML}>Convert .YAML</button>
        </div>
        <p>
          Issue? Reach out to{" "}
          <a href="https://www.linkedin.com/in/hamishleith/">Hamish</a>
        </p>
      </div>
    </div>
  );
}

export default App;
