exports.handler = async function (event, context) {
    try {
      const accessToken = process.env.GITHUB_ACCESS_TOKEN;
  
      return {
        statusCode: 200,
        body: JSON.stringify({ accessToken })
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Internal Server Error' })
      };
    }
  };