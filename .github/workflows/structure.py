import enum
from typing import Any, Literal

import pydantic


class Base(pydantic.BaseModel):
    model_config = pydantic.ConfigDict(extra='forbid')


class ArgumentType(enum.StrEnum):
    ARGUMENT = "argument"
    COMMAND = "command"
    PATH = "path"
    URL = "url"
    VALUE = "value"


class DisabledType(enum.StrEnum):
    DISABLED = "disabled"


class Model(Base):
    versions: "Versions"
    alias: str | None = pydantic.constr(min_length=1)
    profiles: list["Profile"] = pydantic.Field(..., min_length=1)


class Versions(Base):
    argfuscator: str = pydantic.Field(pattern=r'\d+\.\d+')
    format: Literal["2.0"]


class Profile(Base):
    model_config = pydantic.ConfigDict(extra='forbid')
    executableVersion: str
    operatingSystem: str
    operatingSystemVersion: str
    parameters: "ArgFuscatorOptions"


class ArgFuscatorOptions(Base):
    command: list[dict[ArgumentType | DisabledType, str]] = pydantic.Field(..., min_length=2)
    modifiers: dict[str, Any] = pydantic.Field(min_length=1)
    arguments: list["Argument"] | None = None

    @pydantic.model_validator(mode="before")
    @classmethod
    def validate(cls, values):

        # Find all defined modifiers
        class_mapping = {cls.__name__: cls for cls in Modifier.__subclasses__()}

        # Iterate over found modifiers
        for (key, modifier) in values.get('modifiers').items():
            # Check we have a class for it
            assert key in class_mapping, f"unknown modifier `{key}`"
            # Assert the found modifiers matches the found fields
            class_mapping[key].model_validate(modifier, strict=False)

        return values


class Argument(Base):
    Arguments: list[str]
    ValueCount: pydantic.NonNegativeInt

# Modifiers


class Modifier(Base):
    AppliesTo: list[ArgumentType] = pydantic.Field(..., min_length=1)
    Probability: pydantic.confloat(strict=True, gt=0, le=1)


class UrlTransformer(Modifier):
    LeaveOutProtocol: bool
    LeaveOutDoubleSlashes: bool
    SubstituteSlashes: bool
    IpToHex: bool
    PathTraversal: bool


class ReorderArgs(Modifier):
    CombineShortForm: bool
    RandomiseOrder: bool
    SwapLongShortForm: bool


class Shorthands(Modifier):
    CaseSensitive: bool


class FilePathTransformer(Modifier):
    PathTraversal: bool
    SubstituteSlashes: bool
    ExtraSlashes: bool


class QuoteInsertion(Modifier):
    pass


class RandomCase(Modifier):
    pass


class OptionCharSubstitution(Modifier):
    OutputOptionChars: list[str] = pydantic.Field(pydantic.constr(min_length=1, max_length=1), min_lenght=1)


class Sed(Modifier):
    SedStatements: str


class CharacterInsertion(Modifier):
    Characters: list[str] = pydantic.Field(pydantic.constr(min_length=1, max_length=1), min_lenght=1)
    Offset: pydantic.NonNegativeInt


class Regex(Modifier):
    RegexMatch: str
    RegexReplace: str
    CaseSensitive: bool
