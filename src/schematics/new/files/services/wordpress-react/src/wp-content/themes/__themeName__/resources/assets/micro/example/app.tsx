import React from "react";

export interface AppPropsTypes {
  context: {
    text: string;
  };
}

export const App = ({ context }: AppPropsTypes) => {
  return (
    <div>
      <h1>{context.text}</h1>
    </div>
  );
};

export default App;
