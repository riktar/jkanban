require('./jkanban');

const initializeDom = () => {
    document.body.innerHTML = '<div id="test"></div>';
}

beforeEach(() => {
    initializeDom();
})

const makeSut = (additionalParams) => {
    let options = {
        element: "#test"
    }
    if (additionalParams !== undefined) {
        for (var prop in additionalParams) {
            options[prop] = additionalParams[prop];
        }
    }

    let jkanban = new jKanban(options);
    return jkanban;
}

describe('jKanban TestCase', () => {
    test('Should init jKanban', async () => {
        const sut = makeSut()

        const expected = document.createElement("div")
        expected.setAttribute("id", "test")
        expected.innerHTML = "<div class=\"kanban-container\"></div>"

        expect(sut.element).toStrictEqual(expected);
    })

    test('Should add a board with no items', async () => {
        const boardName = "test-board"
        const sut = makeSut({
            boards: [
                {
                    "id": boardName
                }
            ]
        })

        expect(sut.findBoard(boardName)).not.toBeUndefined()
        expect(sut.getBoardElements(boardName).length).toEqual(0)
    })
});