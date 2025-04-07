import React from 'react'

const CommentInput = () => {
    return (
        <div className="bg-[#d9d9d9] p-4 rounded-xl">
      <textarea
          rows={3}
          className="w-full resize-none p-3 rounded-md bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Коментувати:"
      />
            <div className="flex justify-end mt-3">
                <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition cursor-pointer">
                    Надіслати
                </button>
            </div>
        </div>
    )
}

export default CommentInput
