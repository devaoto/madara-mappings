import ky from "ky";

const bky = ky.extend({
  timeout: 11000,
});

export const getAnify = async (id: string) => {
  try {
    const getInfo = async (id: string) => {
      const res = await bky.get(`https://anify.eltik.cc/info/${id}`);
      const data = await res.json();

      return data;
    };

    const getContentMetadata = async (id: string) => {
      const res = await bky.get(
        `https://anify.eltik.cc/content-metadata/${id}`
      );
      const data = await res.json();

      return data;
    };

    const [info, metadata] = await Promise.all([
      getInfo(id),
      getContentMetadata(id),
    ]);

    return {
      info: info,
      "content-metadata": metadata,
    };
  } catch (error) {
    console.error(error);

    return {
      info: {},
      "content-metadata": {},
    };
  }
};
