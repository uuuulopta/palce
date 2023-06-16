![showcase](https://github.com/uuuulopta/place/assets/29780793/9fabe6e1-02a7-4f4e-879e-2de349c9c94d)

Inspired by reddit's [/r/place](https://www.reddit.com/r/place/) .

Colors are longterm stored inside mongodb and cached inside redis using a bitfield datatype, where offset is the position of a pixel and the pixel itself is stored as an u32 integer.

Uses Websockets for real-time updates.
