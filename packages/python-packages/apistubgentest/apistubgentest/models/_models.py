# coding=utf-8
# --------------------------------------------------------------------------
# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT License. See License.txt in the project root for license information.
# Code generated by Microsoft (R) AutoRest Code Generator.
# Changes may cause incorrect behavior and will be lost if the code is regenerated.
# --------------------------------------------------------------------------

from cgitb import text
from dataclasses import dataclass
from enum import Enum, EnumMeta
from typing import Any, TypedDict, Union


class _CaseInsensitiveEnumMeta(EnumMeta):
    def __getitem__(self, name):
        return super().__getitem__(name.upper())

    def __getattr__(cls, name):
        """Return the enum member matching `name`
        We use __getattr__ instead of descriptors or inserting into the enum
        class' __dict__ in order to support `name` and `value` being both
        properties for enum members (which live in the class' __dict__) and
        enum members themselves.
        """
        try:
            return cls._member_map_[name.upper()]
        except KeyError:
            raise AttributeError(name)


class DocstringClass:
    """A class for testing docstring behavior.
    """

    def docstring_with_default_formal(self, value, another, some_class, **kwargs) -> str:
        """Docstring containing a formal default.

        :param value: Some dummy value, defaults
         to "cat". Extra text.
        :type value: str
        :param another: Something else, defaults
         to dog. Extra text.
        :type another: str
        :param some_class: Some kind of class type, defaults to :py:class:`apistubgen.test.models.FakeObject`.
        :type some_class: class
        :rtype: str
        """
        return f"{value} {another} {some_class}"


class PetEnum(str, Enum, metaclass=_CaseInsensitiveEnumMeta):
    """A test enum
    """
    DOG = "dog"
    CAT = "cat"


class FakeObject(object):
    """Fake Object

    :ivar str name: Name
    :ivar int age: Age
    :ivar union: Union
    :vartype union: Union[bool, PetEnum]
    """
    def __init__(self, name: str, age: int, union: Union[bool, PetEnum]):
        self.name = name
        self.age = age
        self.union = union

    PUBLIC_CONST: str = "SOMETHING"

    # This should be ignored
    _SOME_THING: dict = {
        "cat": "hat"
    }


FakeTypedDict = TypedDict(
    'FakeTypedDict',
    name=str,
    age=int,
    union=Union[bool, FakeObject, PetEnum]
)


@dataclass
class FakeInventoryItemDataClass:
    """Class for testing @dataclass
    """
    name: str
    unit_price: float
    quantity_on_hand: int = 0

    def total_cost(self, **kwargs) -> float:
        return self.unit_price * self.quantity_on_hand


class PublicPrivateClass:

    public_var: str = "SOMEVAL"

    _private_var: str

    public_dict: dict = {"a": "b"}

    _private_dict: dict = {"c": "d"}

    def __init__(self):
        self.public_var = "test"

    def _private_func(self) -> str:
        return ""

    def public_func(self, **kwargs) -> str:
        return ""


class RequiredKwargObject:
    """A class with required kwargs.
    :param str id: An id. Required.
    :keyword str name: Required. The name.
    :keyword int age: Required. The age.
    :keyword str other: Some optional thing.
    """

    def __init__(self, id: str, *, name: str, age: int, other: str = None, **kwargs: "Any"):
        self.id = id
        self.name = name
        self.age = age
        self.other = other


class ObjectWithDefaults:

    def __init__(self, name: str = "Bob", age: int = 21, is_awesome: bool = True, pet: PetEnum = PetEnum.dog):
        self.name = name
        self.age = age
        self.is_awesome = is_awesome
        self.pet = pet

class SomePoorlyNamedObject:

    def __init__(self, name: str):
        self.name = name
